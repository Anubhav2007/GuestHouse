import React from 'react';

const GuesthouseCard = ({ guesthouse, onBook }) => {
  return (
    <div className="card transform hover:scale-105 transition-transform duration-200 ease-in-out">
      <div className="p-2"> {/* Minimal padding inside card itself for image if any*/}
        {/* You can add an image here if you have URLs */}
        {/* <img src={guesthouse.imageUrl || 'https://via.placeholder.com/300x200'} alt={guesthouse.name} className="w-full h-48 object-cover rounded-t-lg"/> */}
      </div>
      <div className="p-4"> {/* Padding for text content */}
        <h3 className="text-xl font-semibold text-gray-800 mb-2 truncate" title={guesthouse.name}>
          {guesthouse.name}
        </h3>
        <p className="text-sm text-gray-600 mb-1">
          <span className="font-medium">Location:</span> {guesthouse.location}
        </p>
        <p className="text-sm text-gray-600 mb-3">
          <span className="font-medium">Capacity:</span> {guesthouse.capacity} person(s)
        </p>
        <button
          onClick={() => onBook(guesthouse)}
          className="btn-primary w-full"
        >
          Book Now
        </button>
      </div>
    </div>
  );
};

export default GuesthouseCard;