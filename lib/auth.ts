import { supabase } from './supabase'
import type { UserRole, UserType } from './supabase'

export const signUp = async (
  email: string,
  password: string,
  name: string,
  phone: string,
  userType: UserType,
  role?: UserRole,
  specialKey?: string,
  projectKey?: string
) => {
  try {
    // Validate project key if provided
    if (projectKey) {
      const { data: keyValidation } = await supabase.rpc('validate_project_key', {
        key_input: projectKey,
      })

      if (!keyValidation || keyValidation.length === 0 || !keyValidation[0].is_valid) {
        throw new Error('Invalid or expired project key')
      }

      if (!role && keyValidation[0].default_role) {
        role = keyValidation[0].default_role
      }
    }

    // Sign up the user
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          phone,
          user_type: userType,
          role: role || null,
          special_key: specialKey || null,
          project_key: projectKey || null,
        },
      },
    })

    if (error) throw error

    // ✅ Insert user into 'profiles' table after successful signup
    if (data?.user) {
      await supabase.from('profiles').insert({
        id: data.user.id, // this should match auth.users.id
        name,
        phone,
        user_type: userType,
        role: role || null,
      })
    }

    // Link user to the project if valid project key provided
    if (data?.user && projectKey) {
      const { data: keyValidation } = await supabase.rpc('validate_project_key', {
        key_input: projectKey,
      })

      if (keyValidation && keyValidation.length > 0 && keyValidation[0].is_valid) {
        await supabase.from('user_projects').insert({
          user_id: data.user.id,
          project_id: keyValidation[0].project_id,
          role: role || keyValidation[0].default_role,
        })
      }
    }

    return { data, error: null }
  } catch (error) {
    return { data: null, error }
  }
}

export const signIn = async (email: string, password: string) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    return { data: null, error }
  }
}

export const signOut = async () => {
  const { error } = await supabase.auth.signOut()
  return { error }
}

export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

export const updateUserRole = async (userId: string, role: UserRole) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .update({ role })
      .eq('id', userId)
      .select('*')
      .single()

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    return { data: null, error }
  }
}
