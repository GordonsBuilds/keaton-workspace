import { describe, expect, it } from "vitest";
import { sampleProject } from "./models";
import { reducer } from "./state";

describe("Move Planner reducer", () => {
  it("creates and assigns an item to a trip", () => {
    const initial = sampleProject();
    const categoryId = initial.categories[0].id;
    const tripId = initial.trips[0].id;
    const withItem = reducer(initial, { type: "addItem", name: "Lamp", categoryId, itemType: "item", notes: "" });
    const lamp = withItem.items.find((item) => item.name === "Lamp")!;
    const assigned = reducer(withItem, { type: "assign", itemId: lamp.id, tripId });
    expect(assigned.items.find((item) => item.id === lamp.id)?.tripId).toBe(tripId);
  });

  it("tracks box packing and floor placement", () => {
    const initial = sampleProject();
    const box = initial.items.find((item) => item.type === "box")!;
    const packed = reducer(initial, { type: "togglePacked", boxId: box.id, subId: box.subItems[0].id });
    expect(packed.items.find((item) => item.id === box.id)?.subItems[0].packed).toBe(true);
    const placed = reducer(packed, { type: "place", itemId: box.id, position: { x: 25, y: 60 } });
    expect(placed.items.find((item) => item.id === box.id)?.floorPosition).toEqual({ x: 25, y: 60 });
  });

  it("deleting a trip unassigns its items", () => {
    const initial = sampleProject();
    const item = initial.items[0];
    const tripId = initial.trips[0].id;
    const assigned = reducer(initial, { type: "assign", itemId: item.id, tripId });
    const result = reducer(assigned, { type: "deleteTrip", id: tripId });
    expect(result.items.find((i) => i.id === item.id)?.tripId).toBeNull();
  });
});
