export type ItemType = "item" | "box";
export type FloorPosition = { x: number; y: number };
export type Category = { id: string; name: string };
export type SubItem = {
  id: string;
  name: string;
  notes: string;
  packed: boolean;
};
export type InventoryItem = {
  id: string;
  name: string;
  categoryId: string;
  type: ItemType;
  notes: string;
  tripId: string | null;
  floorPosition: FloorPosition | null;
  subItems: SubItem[];
  expanded?: boolean;
};
export type Trip = {
  id: string;
  name: string;
  vehicle: string;
  notes: string;
  completed: boolean;
};
export type MoveProject = {
  projectName: string;
  categories: Category[];
  items: InventoryItem[];
  trips: Trip[];
  floorPlanImage: string | null;
};

export const uid = () => crypto.randomUUID();
export const sampleProject = (): MoveProject => ({
  projectName: "Move Planner",
  floorPlanImage: null,
  categories: [
    { id: "furniture", name: "Furniture" },
    { id: "electronics", name: "Electronics" },
    { id: "boxes", name: "Boxes" },
  ],
  items: [
    {
      id: uid(),
      name: "Couch",
      categoryId: "furniture",
      type: "item",
      notes: "Living room sofa",
      tripId: null,
      floorPosition: null,
      subItems: [],
    },
    {
      id: uid(),
      name: "Bed",
      categoryId: "furniture",
      type: "item",
      notes: "",
      tripId: null,
      floorPosition: null,
      subItems: [],
    },
    {
      id: uid(),
      name: "Desk",
      categoryId: "furniture",
      type: "item",
      notes: "",
      tripId: null,
      floorPosition: null,
      subItems: [],
    },
    {
      id: uid(),
      name: "Television",
      categoryId: "electronics",
      type: "item",
      notes: "",
      tripId: null,
      floorPosition: null,
      subItems: [],
    },
    {
      id: uid(),
      name: "Desktop computer",
      categoryId: "electronics",
      type: "item",
      notes: "",
      tripId: null,
      floorPosition: null,
      subItems: [],
    },
    {
      id: uid(),
      name: "Kitchen Box",
      categoryId: "boxes",
      type: "box",
      notes: "Kitchen essentials",
      tripId: null,
      floorPosition: null,
      expanded: true,
      subItems: ["Plates", "Cups", "Silverware", "Cooking utensils"].map(
        (name) => ({ id: uid(), name, notes: "", packed: false }),
      ),
    },
  ],
  trips: [
    { id: uid(), name: "Trip 1", vehicle: "Car", notes: "", completed: false },
    {
      id: uid(),
      name: "Trip 2",
      vehicle: "Moving truck",
      notes: "",
      completed: false,
    },
  ],
});

export const statusOf = (item: InventoryItem) =>
  item.floorPosition
    ? "Placed on floor plan"
    : item.tripId
      ? "Assigned to trip"
      : "Unassigned";
