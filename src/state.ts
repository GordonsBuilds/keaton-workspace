import { uid } from "./models";
import type { MoveProject } from "./models";
export type Action =
  | { type: "addCategory"; name: string }
  | { type: "renameCategory"; id: string; name: string }
  | { type: "deleteCategory"; id: string }
  | {
      type: "addItem";
      name: string;
      categoryId: string;
      itemType: "item" | "box";
      notes: string;
    }
  | { type: "deleteItem"; id: string }
  | { type: "assign"; itemId: string; tripId: string | null }
  | { type: "place"; itemId: string; position: { x: number; y: number } | null }
  | { type: "toggleBox"; id: string }
  | { type: "addSubItem"; boxId: string; name: string }
  | { type: "togglePacked"; boxId: string; subId: string }
  | { type: "addTrip"; name: string; vehicle: string; notes: string }
  | { type: "deleteTrip"; id: string }
  | { type: "toggleTrip"; id: string }
  | { type: "setImage"; image: string | null };

export function reducer(state: MoveProject, action: Action): MoveProject {
  switch (action.type) {
    case "addCategory":
      return {
        ...state,
        categories: [...state.categories, { id: uid(), name: action.name }],
      };
    case "renameCategory":
      return {
        ...state,
        categories: state.categories.map((c) =>
          c.id === action.id ? { ...c, name: action.name } : c,
        ),
      };
    case "deleteCategory":
      return {
        ...state,
        categories: state.categories.filter((c) => c.id !== action.id),
        items: state.items.filter((i) => i.categoryId !== action.id),
      };
    case "addItem":
      return {
        ...state,
        items: [
          ...state.items,
          {
            id: uid(),
            name: action.name,
            categoryId: action.categoryId,
            type: action.itemType,
            notes: action.notes,
            tripId: null,
            floorPosition: null,
            subItems: [],
            expanded: true,
          },
        ],
      };
    case "deleteItem":
      return { ...state, items: state.items.filter((i) => i.id !== action.id) };
    case "assign":
      return {
        ...state,
        items: state.items.map((i) =>
          i.id === action.itemId ? { ...i, tripId: action.tripId } : i,
        ),
      };
    case "place":
      return {
        ...state,
        items: state.items.map((i) =>
          i.id === action.itemId ? { ...i, floorPosition: action.position } : i,
        ),
      };
    case "toggleBox":
      return {
        ...state,
        items: state.items.map((i) =>
          i.id === action.id ? { ...i, expanded: !i.expanded } : i,
        ),
      };
    case "addSubItem":
      return {
        ...state,
        items: state.items.map((i) =>
          i.id === action.boxId
            ? {
                ...i,
                subItems: [
                  ...i.subItems,
                  { id: uid(), name: action.name, notes: "", packed: false },
                ],
              }
            : i,
        ),
      };
    case "togglePacked":
      return {
        ...state,
        items: state.items.map((i) =>
          i.id === action.boxId
            ? {
                ...i,
                subItems: i.subItems.map((s) =>
                  s.id === action.subId ? { ...s, packed: !s.packed } : s,
                ),
              }
            : i,
        ),
      };
    case "addTrip":
      return {
        ...state,
        trips: [
          ...state.trips,
          {
            id: uid(),
            name: action.name,
            vehicle: action.vehicle,
            notes: action.notes,
            completed: false,
          },
        ],
      };
    case "deleteTrip":
      return {
        ...state,
        trips: state.trips.filter((t) => t.id !== action.id),
        items: state.items.map((i) =>
          i.tripId === action.id ? { ...i, tripId: null } : i,
        ),
      };
    case "toggleTrip":
      return {
        ...state,
        trips: state.trips.map((t) =>
          t.id === action.id ? { ...t, completed: !t.completed } : t,
        ),
      };
    case "setImage":
      return { ...state, floorPlanImage: action.image };
  }
}
