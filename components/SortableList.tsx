import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useMutation } from "convex/react";
import { Trash } from "lucide-react";
import React, { useState, useEffect } from "react";
import { ReactSortable } from "react-sortablejs";

interface ItemType {
  id: string;
  name:
    | "interested"
    | "applied"
    | "assessment"
    | "interviewed"
    | "offered"
    | "rejected"
    | "archived";
}

export default function SortableList({
  list,
  id,
}: {
  list: string[] | null;
  id: Id<"applications"> | null;
}) {
  // Transform string array to objects with IDs
  const [items, setItems] = useState<ItemType[]>([]);
  const updateStatusHistory = useMutation(api.applications.changeStatusOrder);

  // Update items when list prop changes
  useEffect(() => {
    if (list) {
      const itemsWithIds = list.map((name, index) => ({
        id: `item-${index}-${name}`,
        name: name,
      })) as ItemType[];
      setItems(itemsWithIds);
    } else {
      setItems([]);
    }
  }, [list]);

  // Handle reordering and update parent
  const handleSetItems = (newItems: ItemType[]) => {
    if (!id) return;
    setItems(newItems);
    // Extract just the names and update parent
    const newNames = newItems.map((item) => item.name);
    if (newNames.length > 0) {
      updateStatusHistory({
        id: id,
        currentStatus: newNames[0],
        history: newNames.slice(1),
      });
    }
  };

  const handleDeleteItem = (itemToDelete: ItemType) => {
    if (!id) return;
    const newItems = items.filter((item) => item.id !== itemToDelete.id);
    const newNames = newItems.map((item) => item.name);
    if (newNames.length > 0) {
      updateStatusHistory({
        id: id,
        currentStatus: newNames[0],
        history: newNames.slice(1),
      });
    }
  };

  return (
    <ReactSortable
      list={items}
      setList={handleSetItems}
      animation={200}
      className="flex flex-col gap-2"
    >
      {items.map((item, index) => (
        <div
          key={item.id}
          className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer justify-between ${
            index === 0
              ? "bg-secondary text-secondary-content"
              : "bg-primary text-primary-content"
          }`}
        >
          {item.name.charAt(0).toUpperCase() + item.name.slice(1)}
          <Trash className="w-4 h-4" onClick={() => handleDeleteItem(item)} />
        </div>
      ))}
    </ReactSortable>
  );
}
