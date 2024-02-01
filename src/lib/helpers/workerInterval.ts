import { browser } from '$app/environment';

let worker: SharedWorker;

export function setInterval(callback: () => void, interval: number): string {
	if (!browser) {
		return '';
	}

	worker = new SharedWorker('/workers/interval.js');
	worker.port.start();

	const id: string = crypto.randomUUID();
	worker.port.postMessage({ message: 'start', id, interval });
	worker.port.onmessage = (e) => {
		if (e.data.message === 'callback') {
			callback();
		}
	};

	return id;
}

export function clearInterval(id: string) {
	if (!browser || !worker) {
		return;
	}

	worker.port.postMessage({ message: 'stop', id });
}
