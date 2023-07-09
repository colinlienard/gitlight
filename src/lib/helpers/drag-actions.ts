const lists: Array<{ node: HTMLElement; key: string }> = [];
let itemId: string;
let dropzone: number;
let dragging = false;

export function drag(
	node: HTMLElement,
	{ id, onDragStart }: { id: string; onDragStart: (id: string) => void }
) {
	let x: number;
	let y: number;

	function handleMouseDown(e: MouseEvent) {
		window.addEventListener('mousemove', handleMouseMove);
		window.addEventListener('mouseup', handleMouseUp);

		itemId = id;
		x = e.clientX;
		y = e.clientY;
	}

	function handleMouseMove({ clientX, clientY }: MouseEvent) {
		if (!dragging && (Math.abs(clientX - x) > 5 || Math.abs(clientY - y) > 5)) {
			onDragStart(itemId);
			dragging = true;
		}

		node.setAttribute(
			'style',
			`
        transform: translate(${clientX - x}px, ${clientY - y}px);
        z-index: 10;
        cursor: grabbing;
      `
		);

		for (const list of lists) {
			const listRect = list.node.getBoundingClientRect();
			if (clientX > listRect.left && clientX < listRect.right) {
				dropzone = lists.indexOf(list);
				return;
			}
		}
	}

	function handleMouseUp() {
		window.removeEventListener('mousemove', handleMouseMove);
		window.removeEventListener('mouseup', handleMouseUp);

		dragging = false;
	}

	node.addEventListener('mousedown', handleMouseDown);

	return {
		destroy() {
			node.removeEventListener('mousedown', handleMouseDown);
			window.removeEventListener('mousemove', handleMouseMove);
			window.removeEventListener('mouseup', handleMouseUp);
		}
	};
}

export function drop(
	node: HTMLElement,
	{ key, onDrop }: { key: string; onDrop: (id: string) => void }
) {
	const index = lists.length;
	lists.push({ node, key });

	function handleMouseUp() {
		if (dragging && index === dropzone) {
			onDrop(itemId);
		}
	}
	window.addEventListener('mouseup', handleMouseUp);

	return {
		destroy() {
			window.removeEventListener('mouseup', handleMouseUp);
		}
	};
}
