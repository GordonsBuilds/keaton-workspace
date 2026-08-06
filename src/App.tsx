import React, { useEffect, useRef, useState } from "react";
import { DndContext, useDraggable, useDroppable } from "@dnd-kit/core";
import type { DragEndEvent } from "@dnd-kit/core";
import {
  Box,
  ChevronDown,
  ChevronRight,
  ClipboardList,
  Download,
  GripVertical,
  Map,
  Moon,
  Package,
  Plus,
  Search,
  Truck,
  Upload,
  X,
  Sun,
} from "lucide-react";
import { sampleProject, statusOf } from "./models";
import type { MoveProject, InventoryItem } from "./models";
import { reducer } from "./state";
import type { Action } from "./state";

const badge = (s: string) =>
  s === "Placed on floor plan"
    ? "#dff7ed"
    : s === "Assigned to trip"
      ? "#fff0c7"
      : "#edf1f3";
function Draggable({
  id,
  children,
}: {
  id: string;
  children: React.ReactNode;
}) {
  const d = useDraggable({ id });
  return (
    <div
      ref={d.setNodeRef}
      style={{
        transform: d.transform
          ? `translate3d(${d.transform.x}px,${d.transform.y}px,0)`
          : undefined,
        zIndex: d.isDragging ? 5 : undefined,
      }}
      className="drag-card"
    >
      {children}
    </div>
  );
}
function DropZone({
  id,
  children,
  className = "",
}: {
  id: string;
  children: React.ReactNode;
  className?: string;
}) {
  const d = useDroppable({ id });
  return (
    <div
      ref={d.setNodeRef}
      className={className + (d.isOver ? " ring-2 ring-teal-400" : "")}
    >
      {children}
    </div>
  );
}
function Modal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-20 grid place-items-center bg-slate-900/30 p-4">
      <div className="panel w-full max-w-md p-5">
        <div className="mb-4 flex justify-between">
          <h3 className="font-bold">{title}</h3>
          <button onClick={onClose}>
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export default function App() {
  const [project, setProject] = useState<MoveProject>(() => {
    try {
      return (
        JSON.parse(localStorage.getItem("move-planner") || "null") ||
        sampleProject()
      );
    } catch {
      return sampleProject();
    }
  });
  const [tab, setTab] = useState("inventory");
  const [query, setQuery] = useState("");
  const [selectedTrip, setSelectedTrip] = useState<string | null>(null);
  const [modal, setModal] = useState<"category" | "item" | "trip" | null>(null);
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem("move-planner-dark") === "true");
  const file = useRef<HTMLInputElement>(null);
  const dispatch = (a: Action) => setProject((p) => reducer(p, a));
  useEffect(
    () => localStorage.setItem("move-planner", JSON.stringify(project)),
    [project],
  );
  useEffect(() => localStorage.setItem("move-planner-dark", String(darkMode)), [darkMode]);
  const items = project.items.filter((i) =>
    i.name.toLowerCase().includes(query.toLowerCase()),
  );
  const assigned = project.items.filter((i) => i.tripId);
  const placed = project.items.filter((i) => i.floorPosition);
  const unassigned = project.items.filter((i) => !i.tripId && !i.floorPosition);
  const exportData = () => {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(
      new Blob([JSON.stringify(project, null, 2)], {
        type: "application/json",
      }),
    );
    a.download = "move-planner.json";
    a.click();
  };
  const importData = (f: File) => {
    const r = new FileReader();
    r.onload = () => {
      try {
        const p = JSON.parse(String(r.result));
        if (
          !p ||
          !Array.isArray(p.items) ||
          !Array.isArray(p.categories) ||
          !Array.isArray(p.trips)
        )
          throw Error();
        setProject(p);
      } catch {
        alert("That file is not a valid Move Planner project.");
      }
    };
    r.readAsText(f);
  };
  const onDragEnd = (e: DragEndEvent) => {
    const id = String(e.active.id),
      over = e.over?.id;
    if (!over) return;
    if (String(over).startsWith("trip:"))
      dispatch({ type: "assign", itemId: id, tripId: String(over).slice(5) });
    else if (over === "floor") {
      const rect = e.over?.rect;
      if (rect)
        dispatch({
          type: "place",
          itemId: id,
          position: {
            x: Math.max(
              3,
              Math.min(97, ((e.delta.x + rect.left) / rect.width) * 100),
            ),
            y: Math.max(
              3,
              Math.min(94, ((e.delta.y + rect.top) / rect.height) * 100),
            ),
          },
        });
    }
  };
  return (
    <DndContext onDragEnd={onDragEnd}>
      <div className={darkMode ? "dark min-h-screen" : "min-h-screen"}>
        <header className="border-b bg-white">
          <div className="mx-auto max-w-[1600px] px-5 py-5">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-teal-600 text-white">
                    <Package size={21} />
                  </div>
                  <div>
                    <h1 className="text-xl font-extrabold tracking-tight">
                      Move Planner
                    </h1>
                    <p className="text-xs text-slate-500">
                      A calmer way to get from here to there.
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="btn" aria-label="Toggle dark mode" title="Toggle dark mode" onClick={() => setDarkMode((value) => !value)}>
                  {darkMode ? <Sun size={14} /> : <Moon size={14} />}
                </button>
                <button className="btn" onClick={exportData}>
                  <Download size={14} /> Export
                </button>
                <label className="btn cursor-pointer">
                  <Upload size={14} /> Import
                  <input
                    className="hidden"
                    type="file"
                    accept=".json"
                    onChange={(e) =>
                      e.target.files?.[0] && importData(e.target.files[0])
                    }
                  />
                </label>
                <button
                  className="btn danger"
                  onClick={() =>
                    confirm("Reset the project and remove all saved data?") &&
                    setProject(sampleProject())
                  }
                >
                  Reset
                </button>
              </div>
            </div>
            <div className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-5">
              {[
                ["Total items", project.items.length, ClipboardList],
                ["Unassigned", unassigned.length, Package],
                ["On trips", assigned.length, Truck],
                ["Placed", placed.length, Map],
                [
                  "Trips complete",
                  project.trips.filter((t) => t.completed).length,
                  Truck,
                ],
              ].map(([label, num, Icon]) => (
                <div className="rounded-xl bg-slate-50 p-3" key={String(label)}>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    {React.createElement(Icon as React.ElementType, { size: 14 })}
                    {String(label)}
                  </div>
                  <div className="mt-1 text-xl font-extrabold">
                    {num as number}
                  </div>
                </div>
              ))}
            </div>
            <nav className="mt-5 flex gap-1 border-b sm:hidden">
              {["inventory", "trips", "floor"].map((t) => (
                <button
                  className={`px-4 py-2 text-sm font-bold ${tab === t ? "border-b-2 border-teal-600 text-teal-700" : ""}`}
                  onClick={() => setTab(t)}
                  key={t}
                >
                  {t === "floor"
                    ? "Floor Plan"
                    : t[0].toUpperCase() + t.slice(1)}
                </button>
              ))}
            </nav>
          </div>
        </header>
        <main className="mx-auto grid max-w-[1600px] gap-4 p-5 lg:grid-cols-[1.1fr_.8fr_1.35fr]">
          {(tab === "inventory" || !innerWidth || innerWidth >= 640) && (
            <Inventory
              project={project}
              items={items}
              query={query}
              setQuery={setQuery}
              dispatch={dispatch}
              modal={modal}
              setModal={setModal}
            />
          )}{" "}
          {(tab === "trips" || !innerWidth || innerWidth >= 640) && (
            <Trips
              project={project}
              selected={selectedTrip}
              setSelected={setSelectedTrip}
              dispatch={dispatch}
              modal={modal}
              setModal={setModal}
            />
          )}{" "}
          {(tab === "floor" || !innerWidth || innerWidth >= 640) && (
            <Floor
              project={project}
              selected={selectedTrip}
              setSelected={setSelectedTrip}
              dispatch={dispatch}
              file={file}
            />
          )}
        </main>
      </div>
    </DndContext>
  );
}

function Inventory({
  project,
  items,
  query,
  setQuery,
  dispatch,
  modal,
  setModal,
}: {
  project: MoveProject;
  items: InventoryItem[];
  query: string;
  setQuery: (v: string) => void;
  dispatch: (a: Action) => void;
  modal: string | null;
  setModal: (v: any) => void;
}) {
  return (
    <section className="panel p-4">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="font-extrabold">Inventory</h2>
          <p className="text-xs text-slate-500">Drag items into a trip.</p>
        </div>
        <button
          className="btn btn-primary flex items-center gap-1"
          onClick={() => setModal("item")}
        >
          <Plus size={14} /> Add item
        </button>
      </div>
      <div className="relative mb-4">
        <Search className="absolute left-3 top-2.5 text-slate-400" size={15} />
        <input
          className="input pl-9"
          placeholder="Search items"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>
      {project.categories.map((c) => (
        <div className="mb-5" key={c.id}>
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
              {c.name}
            </h3>
            <button
              className="text-xs text-teal-700"
              onClick={() => {
                const n = prompt("Rename category", c.name);
                if (n) dispatch({ type: "renameCategory", id: c.id, name: n });
              }}
            >
              Rename
            </button>
          </div>
          {items
            .filter((i) => i.categoryId === c.id)
            .map((i) => (
              <Draggable id={i.id} key={i.id}>
                <div className="mb-2 rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
                  <div className="flex items-start gap-2">
                    <GripVertical size={15} className="mt-1 text-slate-300" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 font-bold text-sm">
                        {i.type === "box" ? (
                          <Box size={15} className="text-amber-600" />
                        ) : (
                          <Package size={15} className="text-teal-600" />
                        )}
                        {i.name}
                      </div>
                      <div className="mt-1 flex flex-wrap gap-1">
                        <span
                          className="badge"
                          style={{ background: badge(statusOf(i)) }}
                        >
                          {statusOf(i)}
                        </span>
                        {i.type === "box" && (
                          <span className="badge bg-amber-50 text-amber-700">
                            {i.subItems.filter((s) => s.packed).length} of{" "}
                            {i.subItems.length} packed
                          </span>
                        )}
                      </div>
                      <div className="mt-2 flex items-center gap-2">
                        <span className="text-[11px] text-slate-500">Assign to:</span>
                        <select
                          className="input !w-auto min-w-28 !py-1 !text-[11px]"
                          value={i.tripId || ""}
                          onChange={(e) => dispatch({ type: "assign", itemId: i.id, tripId: e.target.value || null })}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <option value="">Unassigned</option>
                          {project.trips.map((trip) => <option key={trip.id} value={trip.id}>{trip.name} — {trip.vehicle}</option>)}
                        </select>
                      </div>
                      {i.type === "box" && (
                        <div className="mt-2">
                          <button
                            className="flex items-center gap-1 text-xs text-slate-600"
                            onClick={() =>
                              dispatch({ type: "toggleBox", id: i.id })
                            }
                          >
                            {i.expanded ? (
                              <ChevronDown size={14} />
                            ) : (
                              <ChevronRight size={14} />
                            )}{" "}
                            Contents
                          </button>
                          {i.expanded && (
                            <div className="mt-1 space-y-1 pl-5">
                              {i.subItems.map((s) => (
                                <label
                                  className="flex items-center gap-2 text-xs text-slate-600"
                                  key={s.id}
                                >
                                  <input
                                    type="checkbox"
                                    checked={s.packed}
                                    onChange={() =>
                                      dispatch({
                                        type: "togglePacked",
                                        boxId: i.id,
                                        subId: s.id,
                                      })
                                    }
                                  />
                                  {s.name}
                                </label>
                              ))}
                              <button
                                className="text-xs text-teal-700"
                                onClick={() => {
                                  const n = prompt("Sub-item name");
                                  if (n)
                                    dispatch({
                                      type: "addSubItem",
                                      boxId: i.id,
                                      name: n,
                                    });
                                }}
                              >
                                + sub-item
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    <button
                      className="danger text-xs"
                      onClick={() =>
                        confirm(`Delete ${i.name}?`) &&
                        dispatch({ type: "deleteItem", id: i.id })
                      }
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </Draggable>
            ))}
          {!items.some((i) => i.categoryId === c.id) && (
            <p className="rounded-lg bg-slate-50 p-3 text-xs text-slate-400">
              No items here yet.
            </p>
          )}
        </div>
      ))}
      <button className="btn w-full" onClick={() => setModal("category")}>
        <Plus size={14} /> Add category
      </button>
      {modal === "item" && (
        <ItemModal
          categories={project.categories}
          close={() => setModal(null)}
          dispatch={dispatch}
        />
      )}{" "}
      {modal === "category" && (
        <SimpleModal
          title="Add category"
          label="Category name"
          close={() => setModal(null)}
          submit={(n) => dispatch({ type: "addCategory", name: n })}
        />
      )}
    </section>
  );
}

function ItemModal({
  categories,
  close,
  dispatch,
}: {
  categories: MoveProject["categories"];
  close: () => void;
  dispatch: (a: Action) => void;
}) {
  const [name, setName] = useState("");
  const [categoryId, setCategory] = useState(categories[0]?.id || "");
  const [type, setType] = useState<"item" | "box">("item");
  return (
    <Modal title="Add inventory item" onClose={close}>
      <form
        className="space-y-3"
        onSubmit={(e) => {
          e.preventDefault();
          if (name)
            dispatch({
              type: "addItem",
              name,
              categoryId,
              itemType: type,
              notes: "",
            });
          close();
        }}
      >
        <input
          className="input"
          autoFocus
          placeholder="Item name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <select
          className="input"
          value={categoryId}
          onChange={(e) => setCategory(e.target.value)}
        >
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <select
          className="input"
          value={type}
          onChange={(e) => setType(e.target.value as "item" | "box")}
        >
          <option value="item">Regular item</option>
          <option value="box">Box</option>
        </select>
        <button className="btn btn-primary w-full">Add item</button>
      </form>
    </Modal>
  );
}
function SimpleModal({
  title,
  label,
  close,
  submit,
}: {
  title: string;
  label: string;
  close: () => void;
  submit: (n: string) => void;
}) {
  const [n, setN] = useState("");
  return (
    <Modal title={title} onClose={close}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (n) submit(n);
          close();
        }}
        className="space-y-3"
      >
        <input
          className="input"
          autoFocus
          placeholder={label}
          value={n}
          onChange={(e) => setN(e.target.value)}
        />
        <button className="btn btn-primary w-full">Create</button>
      </form>
    </Modal>
  );
}

function Trips({
  project,
  selected,
  setSelected,
  dispatch,
  modal,
  setModal,
}: {
  project: MoveProject;
  selected: string | null;
  setSelected: (v: string) => void;
  dispatch: (a: Action) => void;
  modal: string | null;
  setModal: (v: any) => void;
}) {
  return (
    <section className="panel p-4">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="font-extrabold">Trips</h2>
          <p className="text-xs text-slate-500">
            Drop items here to assign them.
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setModal("trip")}>
          <Plus size={14} /> Add trip
        </button>
      </div>
      {project.trips.map((t) => (
        <DropZone
          id={`trip:${t.id}`}
          key={t.id}
          className={`mb-3 rounded-xl border p-3 ${selected === t.id ? "border-teal-500 bg-teal-50/40" : "border-slate-200"}`}
        >
          <div className="flex items-start justify-between">
            <button className="text-left" onClick={() => setSelected(t.id)}>
              <div className="flex items-center gap-2 font-bold text-sm">
                <Truck size={16} className="text-teal-600" />
                {t.name}
                <span className="font-normal text-slate-500">
                  — {t.vehicle}
                </span>
              </div>
              <p className="mt-1 text-xs text-slate-500">
                {project.items.filter((i) => i.tripId === t.id).length} items
                assigned
              </p>
            </button>
            <div className="flex gap-2">
              <button
                className="text-xs text-teal-700"
                onClick={() => dispatch({ type: "toggleTrip", id: t.id })}
              >
                {t.completed ? "Reopen" : "Complete"}
              </button>
              <button
                className="danger text-xs"
                onClick={() =>
                  confirm(`Delete ${t.name}?`) &&
                  dispatch({ type: "deleteTrip", id: t.id })
                }
              >
                Delete
              </button>
            </div>
          </div>
          {selected === t.id && (
            <div className="mt-3 space-y-2 border-t pt-3">
              {project.items
                .filter((i) => i.tripId === t.id)
                .map((i) => (
                  <div
                    className="flex items-center justify-between rounded-lg bg-white p-2 text-xs"
                    key={i.id}
                  >
                    <span className="font-semibold">{i.name}</span>
                    <button
                      className="text-slate-500"
                      onClick={() =>
                        dispatch({ type: "assign", itemId: i.id, tripId: null })
                      }
                    >
                      Remove
                    </button>
                  </div>
                ))}
              {!project.items.some((i) => i.tripId === t.id) && (
                <p className="text-xs text-slate-400">
                  No items yet. Drag items here.
                </p>
              )}
            </div>
          )}
        </DropZone>
      ))}
      {modal === "trip" && (
        <TripModal close={() => setModal(null)} dispatch={dispatch} />
      )}
    </section>
  );
}
function TripModal({
  close,
  dispatch,
}: {
  close: () => void;
  dispatch: (a: Action) => void;
}) {
  const [name, setName] = useState(""),
    [vehicle, setVehicle] = useState("");
  return (
    <Modal title="Add moving trip" onClose={close}>
      <form
        className="space-y-3"
        onSubmit={(e) => {
          e.preventDefault();
          if (name) dispatch({ type: "addTrip", name, vehicle, notes: "" });
          close();
        }}
      >
        <input
          className="input"
          autoFocus
          placeholder="Trip name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          className="input"
          placeholder="Vehicle description"
          value={vehicle}
          onChange={(e) => setVehicle(e.target.value)}
        />
        <button className="btn btn-primary w-full">Create trip</button>
      </form>
    </Modal>
  );
}

function Floor({
  project,
  selected,
  setSelected,
  dispatch,
  file,
}: {
  project: MoveProject;
  selected: string | null;
  setSelected: (v: string) => void;
  dispatch: (a: Action) => void;
  file: React.RefObject<HTMLInputElement | null>;
}) {
  const trip = project.trips.find((t) => t.id === selected) || project.trips[0];
  const tripItems = project.items.filter((i) => i.tripId === trip?.id);
  const onFile = (f: File) => {
    if (!f.type.startsWith("image/"))
      return alert("Please choose a PNG, JPG, JPEG, or WEBP image.");
    const r = new FileReader();
    r.onload = () => dispatch({ type: "setImage", image: String(r.result) });
    r.readAsDataURL(f);
  };
  return (
    <section className="panel p-4">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="font-extrabold">Floor Plan</h2>
          <p className="text-xs text-slate-500">
            Drag trip items onto their destination.
          </p>
        </div>
        <div className="flex gap-2">
          <button className="btn" onClick={() => file.current?.click()}>
            <Upload size={14} /> {project.floorPlanImage ? "Replace" : "Upload"}
          </button>
          {project.floorPlanImage && (
            <button
              className="btn danger"
              onClick={() => dispatch({ type: "setImage", image: null })}
            >
              Remove
            </button>
          )}
          <input
            ref={file}
            className="hidden"
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])}
          />
        </div>
      </div>
      <div className="mb-3 flex items-center gap-2">
        <select
          className="input max-w-xs"
          value={trip?.id || ""}
          onChange={(e) => setSelected(e.target.value)}
        >
          <option>
            {trip ? `${trip.name} — ${trip.vehicle}` : "Select a trip"}
          </option>
        </select>
        <span className="text-xs text-slate-500">{tripItems.length} items</span>
      </div>
      <DropZone
        id="floor"
        className="relative min-h-[430px] overflow-hidden rounded-xl border-2 border-dashed border-slate-300 bg-slate-50"
      >
        {project.floorPlanImage ? (
          <img
            src={project.floorPlanImage}
            className="absolute inset-0 h-full w-full object-contain"
          />
        ) : (
          <div className="absolute inset-0 grid place-items-center text-center text-slate-400">
            <div>
              <Map className="mx-auto mb-2" size={32} />
              <p className="font-semibold">
                Upload your destination floor plan
              </p>
              <p className="mt-1 text-xs">PNG, JPG, JPEG, or WEBP</p>
            </div>
          </div>
        )}
        {project.items
          .filter((i) => i.floorPosition)
          .map((i) => (
            <Draggable id={i.id} key={i.id}>
              <div
                className="absolute rounded-lg border border-teal-200 bg-white/95 px-3 py-2 text-xs font-bold shadow-md"
                style={{
                  left: `${i.floorPosition!.x}%`,
                  top: `${i.floorPosition!.y}%`,
                }}
              >
                {i.name}
                <button
                  className="ml-2 text-slate-400"
                  onClick={() =>
                    dispatch({ type: "place", itemId: i.id, position: null })
                  }
                >
                  ×
                </button>
              </div>
            </Draggable>
          ))}
      </DropZone>
      <div className="mt-3 rounded-lg bg-slate-50 p-3 text-xs text-slate-500">
        Items can be assigned to a trip without being placed. Select a trip
        above, then drag its items onto the map.
      </div>
    </section>
  );
}
