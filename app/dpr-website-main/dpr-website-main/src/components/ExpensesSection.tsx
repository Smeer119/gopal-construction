import React, { useState } from 'react'
import { Plus, DollarSign, Receipt, Camera, Edit3, Trash2, Save, X, Calendar } from 'lucide-react'
import { AccordionCard } from './AccordionCard'

export interface PettyCash {
  id: string
  details: string
  amount: number
  date: string
}

export interface Expense {
  id: string
  description: string
  amount: number
  receipt_image: string | null
}

export interface ExpensesData {
  pettyCash: PettyCash[]
  expenses: Expense[]
}

interface ExpensesSectionProps {
  expensesData: ExpensesData
  onUpdateExpenses: (expenses: ExpensesData) => void
}

export const ExpensesSection: React.FC<ExpensesSectionProps> = ({
  expensesData,
  onUpdateExpenses
}) => {
  // Petty Cash States
  const [showPettyCashForm, setShowPettyCashForm] = useState(false)
  const [editingPettyCashId, setEditingPettyCashId] = useState<string | null>(null)
  const [pettyCashFormData, setPettyCashFormData] = useState({
    details: '',
    amount: '',
    date: new Date().toISOString().split('T')[0]
  })

  // Expense States
  const [showExpenseForm, setShowExpenseForm] = useState(false)
  const [editingExpenseId, setEditingExpenseId] = useState<string | null>(null)
  const [expenseFormData, setExpenseFormData] = useState({
    description: '',
    amount: '',
    receipt_image: null as string | null
  })

  const generateId = () => Date.now().toString() + Math.random().toString(36).substr(2, 9)

  // Calculate balance
  const totalReceived = expensesData.pettyCash.reduce((sum, pc) => sum + pc.amount, 0)
  const totalExpenses = expensesData.expenses.reduce((sum, exp) => sum + exp.amount, 0)
  const balance = totalReceived - totalExpenses

  // Petty Cash Handlers
  const handlePettyCashSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const submitData = {
      details: pettyCashFormData.details,
      amount: parseFloat(pettyCashFormData.amount) || 0,
      date: pettyCashFormData.date
    }

    if (editingPettyCashId) {
      const updatedPettyCash = expensesData.pettyCash.map(pc => 
        pc.id === editingPettyCashId ? { ...pc, ...submitData } : pc
      )
      onUpdateExpenses({ ...expensesData, pettyCash: updatedPettyCash })
      setEditingPettyCashId(null)
    } else {
      const newPettyCash = { ...submitData, id: generateId() }
      onUpdateExpenses({ 
        ...expensesData, 
        pettyCash: [...expensesData.pettyCash, newPettyCash] 
      })
      setShowPettyCashForm(false)
    }
    setPettyCashFormData({ details: '', amount: '', date: new Date().toISOString().split('T')[0] })
  }

  const handleEditPettyCash = (pettyCash: PettyCash) => {
    setPettyCashFormData({
      details: pettyCash.details,
      amount: pettyCash.amount.toString(),
      date: pettyCash.date
    })
    setEditingPettyCashId(pettyCash.id)
    setShowPettyCashForm(true)
  }

  const handleDeletePettyCash = (id: string) => {
    const updatedPettyCash = expensesData.pettyCash.filter(pc => pc.id !== id)
    onUpdateExpenses({ ...expensesData, pettyCash: updatedPettyCash })
  }

  const handleCancelPettyCash = () => {
    setShowPettyCashForm(false)
    setEditingPettyCashId(null)
    setPettyCashFormData({ details: '', amount: '', date: new Date().toISOString().split('T')[0] })
  }

  // Expense Handlers
  const handleExpenseSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const submitData = {
      description: expenseFormData.description,
      amount: parseFloat(expenseFormData.amount) || 0,
      receipt_image: expenseFormData.receipt_image
    }

    if (editingExpenseId) {
      const updatedExpenses = expensesData.expenses.map(exp => 
        exp.id === editingExpenseId ? { ...exp, ...submitData } : exp
      )
      onUpdateExpenses({ ...expensesData, expenses: updatedExpenses })
      setEditingExpenseId(null)
    } else {
      const newExpense = { ...submitData, id: generateId() }
      onUpdateExpenses({ 
        ...expensesData, 
        expenses: [...expensesData.expenses, newExpense] 
      })
      setShowExpenseForm(false)
    }
    setExpenseFormData({ description: '', amount: '', receipt_image: null })
  }

  const handleEditExpense = (expense: Expense) => {
    setExpenseFormData({
      description: expense.description,
      amount: expense.amount.toString(),
      receipt_image: expense.receipt_image
    })
    setEditingExpenseId(expense.id)
    setShowExpenseForm(true)
  }

  const handleDeleteExpense = (id: string) => {
    const updatedExpenses = expensesData.expenses.filter(exp => exp.id !== id)
    onUpdateExpenses({ ...expensesData, expenses: updatedExpenses })
  }

  const handleCancelExpense = () => {
    setShowExpenseForm(false)
    setEditingExpenseId(null)
    setExpenseFormData({ description: '', amount: '', receipt_image: null })
  }

  const handleReceiptUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        setExpenseFormData({ ...expenseFormData, receipt_image: event.target?.result as string })
      }
      reader.readAsDataURL(file)
    }
  }

  const totalCount = expensesData.pettyCash.length + expensesData.expenses.length

  return (
    <AccordionCard title="Expenses / Petty Cash" badge={totalCount}>
      <div className="space-y-8">
        {/* Balance Summary */}
        <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4 border border-green-200">
          <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-green-600" />
            Financial Summary
          </h4>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-sm text-gray-600">Total Received</p>
              <p className="text-lg font-bold text-green-600">₹{totalReceived.toFixed(2)}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600">Total Expenses</p>
              <p className="text-lg font-bold text-red-600">₹{totalExpenses.toFixed(2)}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600">Balance</p>
              <p className={`text-lg font-bold ${balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                ₹{balance.toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        {/* Received Petty Cash Section */}
        <div className="bg-green-50 rounded-lg p-4 border border-green-200">
          <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-green-600" />
            Received Petty Cash
          </h4>
          
          <div className="space-y-3 mb-4">
            {expensesData.pettyCash.map((pettyCash) => (
              <div key={pettyCash.id} className="bg-white rounded-lg p-3 border border-green-200">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-1">
                      <h5 className="font-medium text-gray-800">{pettyCash.details}</h5>
                      <span className="bg-green-100 text-green-800 text-sm px-2 py-1 rounded-full font-medium">
                        ₹{pettyCash.amount}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4 text-green-600" />
                      <span className="text-sm text-gray-600">{pettyCash.date}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditPettyCash(pettyCash)}
                      className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeletePettyCash(pettyCash.id)}
                      className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {(showPettyCashForm || editingPettyCashId) && (
            <form onSubmit={handlePettyCashSubmit} className="bg-white rounded-lg p-4 border border-green-300 mb-4">
              <h5 className="font-medium text-gray-800 mb-3">
                {editingPettyCashId ? 'Edit Petty Cash' : 'Add Petty Cash'}
              </h5>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Details</label>
                  <input
                    type="text"
                    value={pettyCashFormData.details}
                    onChange={(e) => setPettyCashFormData({ ...pettyCashFormData, details: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Cash received from..."
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Amount (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={pettyCashFormData.amount}
                    onChange={(e) => setPettyCashFormData({ ...pettyCashFormData, amount: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                   placeholder="Enter amount"
                    min="0"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <input
                    type="date"
                    value={pettyCashFormData.date}
                    onChange={(e) => setPettyCashFormData({ ...pettyCashFormData, date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <button
                  type="submit"
                  className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Save className="w-4 h-4" />
                  {editingPettyCashId ? 'Update' : 'Add'}
                </button>
                <button
                  type="button"
                  onClick={handleCancelPettyCash}
                  className="flex items-center gap-2 bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
                >
                  <X className="w-4 h-4" />
                  Cancel
                </button>
              </div>
            </form>
          )}

          {!showPettyCashForm && !editingPettyCashId && (
            <button
              onClick={() => setShowPettyCashForm(true)}
              className="w-full flex items-center justify-center gap-2 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Petty Cash
            </button>
          )}
        </div>

        {/* Expenses Section */}
        <div className="bg-red-50 rounded-lg p-4 border border-red-200">
          <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Receipt className="w-5 h-5 text-red-600" />
            Expenses
          </h4>
          
          <div className="space-y-3 mb-4">
            {expensesData.expenses.map((expense) => (
              <div key={expense.id} className="bg-white rounded-lg p-3 border border-red-200">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-1">
                      <h5 className="font-medium text-gray-800">{expense.description}</h5>
                      <span className="bg-red-100 text-red-800 text-sm px-2 py-1 rounded-full font-medium">
                        ₹{expense.amount}
                      </span>
                    </div>
                    {expense.receipt_image && (
                      <img 
                        src={expense.receipt_image} 
                        alt="Receipt"
                        className="w-24 h-24 object-cover rounded-lg border border-gray-300 shadow-sm hover:shadow-md transition-shadow cursor-pointer mt-2"
                        onClick={() => window.open(expense.receipt_image!, '_blank')}
                      />
                    )}
                  </div>
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => handleEditExpense(expense)}
                      className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteExpense(expense.id)}
                      className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {(showExpenseForm || editingExpenseId) && (
            <form onSubmit={handleExpenseSubmit} className="bg-white rounded-lg p-4 border border-red-300 mb-4">
              <h5 className="font-medium text-gray-800 mb-3">
                {editingExpenseId ? 'Edit Expense' : 'Add Expense'}
              </h5>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <input
                    type="text"
                    value={expenseFormData.description}
                    onChange={(e) => setExpenseFormData({ ...expenseFormData, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="What was purchased..."
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Amount (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={expenseFormData.amount}
                    onChange={(e) => setExpenseFormData({ ...expenseFormData, amount: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                   placeholder="Enter amount"
                    min="0"
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Receipt Image (Optional)</label>
                  <div className="flex items-center gap-4">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleReceiptUpload}
                      className="hidden"
                      id="receipt-upload"
                    />
                    <label
                      htmlFor="receipt-upload"
                      className="flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer"
                    >
                      <Camera className="w-4 h-4" />
                      Upload Receipt
                    </label>
                    {expenseFormData.receipt_image && (
                      <img 
                        src={expenseFormData.receipt_image} 
                        alt="Preview"
                        className="w-20 h-20 object-cover rounded-lg border border-gray-300 shadow-sm"
                      />
                    )}
                  </div>
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <button
                  type="submit"
                  className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                >
                  <Save className="w-4 h-4" />
                  {editingExpenseId ? 'Update' : 'Add'}
                </button>
                <button
                  type="button"
                  onClick={handleCancelExpense}
                  className="flex items-center gap-2 bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
                >
                  <X className="w-4 h-4" />
                  Cancel
                </button>
              </div>
            </form>
          )}

          {!showExpenseForm && !editingExpenseId && (
            <button
              onClick={() => setShowExpenseForm(true)}
              className="w-full flex items-center justify-center gap-2 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Expense
            </button>
          )}
        </div>
      </div>
    </AccordionCard>
  )
}