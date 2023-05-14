import { persist, restore } from "./persistence";
import { onPatch, types } from "mobx-state-tree";
import type { IDisposer, Instance, SnapshotOut } from "mobx-state-tree";

const STORAGE_NAMESPACE = "_jake_boiwa_store";

const rootState = types
  .model({
    roomUUID: types.maybeNull(types.string),
    order: types.number,
  })
  .actions((self) => {
    let disposer: IDisposer | null = null;

    function _persistState() {
      persist(STORAGE_NAMESPACE, self);
    }

    function restoreCache() {
      const state = restore(STORAGE_NAMESPACE);
      Object.assign(self, state);
    }

    function afterCreate() {
      disposer = onPatch(self, _persistState);
    }

    function beforeDetach() {
      if (disposer) {
        disposer();
      }
    }

    function setRoomDetails(roomUUID: string, order: number) {
      self.roomUUID = roomUUID;
      self.order = order;
    }

    return {
      afterCreate,
      beforeDetach,
      restoreCache,
      setRoomDetails,
    };
  });

export const store = rootState.create({
  roomUUID: null,
  order: 0,
});

export type IStore = Instance<typeof store>;
export type ISnapshotStore = SnapshotOut<typeof store>;
