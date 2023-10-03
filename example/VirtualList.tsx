import React from "react";
import { VirtualList } from "../lib";

const VirtualListExample = () => {
  const rowStyle = {
    padding: "0 10px",
    borderBottom: "1px solid grey",
    lineHeight: "50px",
  };
  const renderItem = ({ style, index }: { style: any; index: number }) => {
    return (
      <div style={{ ...rowStyle, ...style }} key={index}>
        Row #{index}
      </div>
    );
  };

  return (
    <div>
      <h2>VirtualListExample: </h2>
      <VirtualList
        width="auto"
        height={400}
        itemCount={1000}
        renderItem={renderItem}
        itemSize={50}
      />
    </div>
  );
};

export default VirtualListExample;
