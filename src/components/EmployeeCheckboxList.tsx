import type { Employee } from '@/lib/types'

type Props = {
  employees: Employee[]
  selected: number[]
  onChange: (ids: number[]) => void
  idPrefix?: string
}

export default function EmployeeCheckboxList({
  employees,
  selected,
  onChange,
  idPrefix = 'employee',
}: Props) {
  const toggle = (id: number, checked: boolean) => {
    onChange(
      checked
        ? [...selected, id]
        : selected.filter((selectedId) => selectedId !== id),
    )
  }

  if (employees.length === 0) {
    return <p className="text-sm text-gray-500">No employees yet.</p>
  }

  return (
    <div className="max-h-48 space-y-1 overflow-y-auto rounded border border-gray-300 p-2">
      {employees.map((employee) => {
        const inputId = `${idPrefix}-${employee.id}`
        return (
          <label
            key={employee.id}
            htmlFor={inputId}
            className="flex cursor-pointer items-center gap-2 rounded px-1 py-0.5 hover:bg-gray-50"
          >
            <input
              id={inputId}
              type="checkbox"
              checked={selected.includes(employee.id)}
              onChange={(e) => toggle(employee.id, e.target.checked)}
              className="h-4 w-4 rounded border-gray-300"
            />
            <span className="text-sm">{employee.full_name}</span>
          </label>
        )
      })}
    </div>
  )
}
