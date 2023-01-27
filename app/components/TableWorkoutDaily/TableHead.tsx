import * as React from "react";

const TableHead = () => {
    return (
        <div className="px-2" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr) 0.3fr',
            gridTemplateRows: '1fr',
            gridColumnGap: '16px',
            gridRowGap: '16px'
        }}>
            <div style={{gridArea: '1 / 1 / 2 / 2'}} className="px-2 py-2 text-xs text-gray-500">Repetitions</div>
            <div style={{gridArea: '1 / 2 / 2 / 3'}} className="px-2 py-2 text-xs text-gray-500">Poids</div>
            <div style={{gridArea: '1 / 3 / 2 / 4'}} className="px-2 py-2 text-xs text-gray-500">Action</div>
        </div>
    );
};


export default TableHead;