import { useState } from "react";
import { createUnit, updateUnit, deleteUnit } from "../../../services/units.js";
import { deleteBuilding } from "../../../services/buildings.js";
import { formatPrice } from "../../../utils/format.js";
import Modal from "../../../components/common/Modal.jsx";
import UnitFieldsForm from "./UnitFieldsForm.jsx";

const STATUSES = ["AVAILABLE", "RESERVED", "SOLD"];

function BuildingManager({ building, onChange }) {
  const [showAddUnit, setShowAddUnit] = useState(false);
  const [editingUnit, setEditingUnit] = useState(null);

  async function handleDeleteBuilding() {
    if (!window.confirm(`Delete "${building.name}" and all its units?`)) return;
    await deleteBuilding(building.id);
    onChange();
  }

  async function handleAddUnit(data) {
    await createUnit({ ...data, buildingId: building.id });
    setShowAddUnit(false);
    onChange();
  }

  async function handleUpdateUnit(data) {
    await updateUnit(editingUnit.id, data);
    setEditingUnit(null);
    onChange();
  }

  async function handleDeleteUnit(unit) {
    if (!window.confirm(`Delete unit ${unit.unitNumber}?`)) return;
    await deleteUnit(unit.id);
    onChange();
  }

  async function handleStatusChange(unit, status) {
    await updateUnit(unit.id, { status });
    onChange();
  }

  return (
    <div className="building-manager">
      <div className="building-manager-header">
        <h3>{building.name}</h3>
        <button className="link-button link-button-danger" onClick={handleDeleteBuilding}>
          Delete Building
        </button>
      </div>

      {building.units.length === 0 ? (
        <p className="state-message">No units yet.</p>
      ) : (
        <table className="admin-table">
          <thead>
            <tr>
              <th>Unit</th>
              <th>Floor</th>
              <th>BHK</th>
              <th>Area</th>
              <th>Price</th>
              <th>Facing</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {building.units.map((unit) => (
              <tr key={unit.id}>
                <td>{unit.unitNumber}</td>
                <td>{unit.floor}</td>
                <td>{unit.bhk}</td>
                <td>{unit.area}</td>
                <td>{formatPrice(unit.price)}</td>
                <td>{unit.facing || "—"}</td>
                <td>
                  <select
                    value={unit.status}
                    onChange={(event) => handleStatusChange(unit, event.target.value)}
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="admin-table-actions">
                  <button className="link-button" onClick={() => setEditingUnit(unit)}>
                    Edit
                  </button>
                  <button
                    className="link-button link-button-danger"
                    onClick={() => handleDeleteUnit(unit)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {showAddUnit ? (
        <UnitFieldsForm onSubmit={handleAddUnit} submitLabel="Add Unit" />
      ) : (
        <button className="btn btn-secondary" onClick={() => setShowAddUnit(true)}>
          Add Unit
        </button>
      )}

      {editingUnit && (
        <Modal onClose={() => setEditingUnit(null)}>
          <h3>Edit Unit {editingUnit.unitNumber}</h3>
          <UnitFieldsForm
            initialUnit={editingUnit}
            onSubmit={handleUpdateUnit}
            submitLabel="Save Changes"
          />
        </Modal>
      )}
    </div>
  );
}

export default BuildingManager;
