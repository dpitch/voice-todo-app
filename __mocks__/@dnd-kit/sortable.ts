export const useSortable = ({ id }: { id: string }) => ({
  attributes: {
    role: "button",
    tabIndex: 0,
    "aria-roledescription": "sortable",
    "aria-describedby": `DndDescribedBy-${id}`,
    "aria-disabled": false,
  },
  listeners: {},
  setNodeRef: () => {},
  transform: null,
  transition: null,
  isDragging: false,
})

export const SortableContext = ({
  children,
}: {
  children: React.ReactNode
  items: string[]
  strategy?: unknown
}) => children

export const verticalListSortingStrategy = {}
export const sortableKeyboardCoordinates = () => null

export function arrayMove<T>(array: T[], from: number, to: number): T[] {
  const newArray = array.slice()
  const [removed] = newArray.splice(from, 1)
  newArray.splice(to, 0, removed)
  return newArray
}
