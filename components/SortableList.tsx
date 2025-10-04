import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useMutation } from "convex/react";
import { Trash } from "lucide-react";
import React, { useState, useEffect } from "react";
import { ReactSortable } from "react-sortablejs";

/**
 * Interface defining the structure of items in the sortable list
 * Each item represents a job application status with a unique ID
 */
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

/**
 * SortableList Component
 *
 * A drag-and-drop sortable list component for managing job application status history.
 * Allows users to reorder status items and delete them from the list.
 * The first item represents the current status, while the rest represent the history.
 *
 * @param list - Array of status strings representing the application's status history
 * @param id - The application ID for updating the status in the database
 */
export default function SortableList({
  list,
  id,
}: {
  list: string[] | null;
  id: Id<"applications"> | null;
}) {
  // Local state to manage the sortable items with unique IDs
  const [items, setItems] = useState<ItemType[]>([]);

  // Mutation hook for updating application status history in Convex database
  const updateStatusHistory = useMutation(api.applications.changeStatusOrder);

  /**
   * Effect hook to sync local items state with the incoming list prop
   * Transforms string array into objects with unique IDs for ReactSortable
   */
  useEffect(() => {
    if (list) {
      // Create items with unique IDs by combining index and name
      const itemsWithIds = list.map((name, index) => ({
        id: `item-${index}-${name}`,
        name: name,
      })) as ItemType[];
      setItems(itemsWithIds);
    } else {
      // Clear items if no list provided
      setItems([]);
    }
  }, [list]);

  /**
   * Handles reordering of items when user drags and drops
   * Updates the application's status history in the database
   * First item becomes current status, rest become history
   */
  const handleSetItems = (newItems: ItemType[]) => {
    if (!id) return;

    // Update local state
    setItems(newItems);

    // Extract status names from reordered items
    const newNames = newItems.map((item) => item.name);

    // Update database if we have items
    if (newNames.length > 0) {
      updateStatusHistory({
        id: id,
        currentStatus: newNames[0], // First item is current status
        history: newNames.slice(1), // Rest are history
      });
    }
  };

  /**
   * Handles deletion of individual status items
   * Removes the item from the list and updates the database
   */
  const handleDeleteItem = (itemToDelete: ItemType) => {
    if (!id) return;

    // Filter out the deleted item
    const newItems = items.filter((item) => item.id !== itemToDelete.id);
    const newNames = newItems.map((item) => item.name);

    // Update database with remaining items
    if (newNames.length > 0) {
      updateStatusHistory({
        id: id,
        currentStatus: newNames[0], // First item becomes current status
        history: newNames.slice(1), // Rest become history
      });
    }
  };

  return (
    <ReactSortable
      list={items}
      setList={handleSetItems}
      animation={200} // Smooth animation duration for drag and drop
      className="flex flex-col gap-2"
    >
      {items.map((item, index) => (
        <div
          key={item.id}
          className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer justify-between ${
            // First item (current status) gets different styling
            index === 0
              ? "bg-secondary text-secondary-content"
              : "bg-primary text-primary-content"
          }`}
        >
          {/* Display status name with capitalized first letter */}
          {item.name.charAt(0).toUpperCase() + item.name.slice(1)}

          {/* Delete button for removing status from history */}
          <Trash className="w-4 h-4" onClick={() => handleDeleteItem(item)} />
        </div>
      ))}
    </ReactSortable>
  );
}
