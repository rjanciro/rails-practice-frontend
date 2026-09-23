export type Employee = {
  id: number
  full_name: string
  age: number | null
  active: boolean
}

export type Task = {
  id: number
  title: string
  description: string | null
  employee_id: number | null
}

export type EmployeeDetail = Employee & {
  tasks: Task[]
}

export type User = {
  id: number
  email_address: string
  role: 'user' | 'admin'
}