import React from "react";

const Project = ({ id, name }: Props) => {
  return (
    <div>
      <div>
        {name}, ID:{id}
      </div>
    </div>
  );
};

export default Project;
