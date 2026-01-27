import React from 'react';

const WIWFMButton = ({ onClick, disabled }) => (
	<button
		className={`bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-3 rounded ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
		onClick={disabled ? undefined : onClick}
	>
		Will it work for me?
	</button>
);

export default WIWFMButton;
