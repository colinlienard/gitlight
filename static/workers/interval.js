const INTERVALS = new Map();

self.addEventListener('connect', ({ ports }) => {
	const port = ports[0];

	port.onmessage = ({ data }) => {
		switch (data.message) {
			case 'start': {
				console.log('start', data);
				const interval = setInterval(() => {
					console.log('interval');
					port.postMessage({ message: 'callback' });
				}, data.interval);
				INTERVALS.set(data.id, interval);
				break;
			}

			case 'stop': {
				console.log('stop', data);
				const interval = INTERVALS.get(data.id);
				if (interval) {
					clearInterval(interval);
				}
				break;
			}

			default:
				break;
		}
	};
});
