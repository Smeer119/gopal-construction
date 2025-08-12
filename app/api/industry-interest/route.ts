import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(req: Request) {
  try {
    // Using public Supabase client (anon key). RLS policy must allow anon inserts.

    const { name, email, phone, description } = await req.json();

    if (!name || !email || !phone || !description) {
      return NextResponse.json(
        { error: 'All fields (name, email, phone, description) are required.' },
        { status: 400 }
      );
    }

    // Optional: capture IP/user agent
    const ip = (req.headers.get('x-forwarded-for') || '').split(',')[0]?.trim() || null;
    const ua = req.headers.get('user-agent') || null;

    const { error } = await supabase.from('industry_requests').insert({
      name: String(name),
      email: String(email),
      phone: String(phone),
      description: String(description),
      request_ip: ip,
      user_agent: ua,
    });

    if (error) {
      console.error('Supabase insert error:', error);
      return NextResponse.json({ error: 'Failed to save your request' }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error('Failed to save industry interest:', error);
    return NextResponse.json(
      { error: 'Failed to save your request. Please try again later.' },
      { status: 500 }
    );
  }
}
