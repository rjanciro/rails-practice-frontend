export type Employee = {
  id: number
  full_name: string
  age: number | null
  active: boolean
}

export type TaskEmployee = Pick<Employee, 'id' | 'full_name'>

export type Task = {
  id: number
  title: string
  description: string | null
  employees: TaskEmployee[]
}

export type EmployeeDetail = Employee & {
  tasks: Pick<Task, 'id' | 'title' | 'description'>[]
}

export type User = {
  id: number
  email_address: string
  role: 'user' | 'admin'
}
