import React from 'react';
import jobs from '../../data/jobs';
import Draggable from 'react-draggable';

class JobPalette extends React.Component {
  render() {
    return (
      <div className="job-palette">
        {Object.entries(jobs).map(([name, data], i) => (
          <Draggable
            key={i}
            position={{ x: 0, y: 0 }}
            onStop={(e, position) => {
              const [x, y] = [e.clientX, e.clientY];
              this.props.dnd.emit('drop', {
                x,
                y,
                job: name
              });
            }}
          >
            <img
              className={'job-icon ' + data.role}
              data-job={name}
              src={data.img}
              alt={data.name}
              draggable="false"
            />
          </Draggable>
        ))}
      </div>
    );
  }
}

export default JobPalette;
