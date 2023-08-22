import { largeScreen } from '../stores';

const lists: Array<{
	node: HTMLElement;
	hovering: boolean;
	onHoverChange: (value: boolean) => void;
}> = [];
let itemId: string;
let dropzone: number;
let dragging = false;

export function drag(
	node: HTMLElement,
	{ id, onDragStart }: { id: string; onDragStart: (id: string) => void }
) {
	let x: number;
	let y: number;
	let vertical = false;

	function handleMouseDown(e: MouseEvent) {
		window.addEventListener('mousemove', handleMouseMove);
		window.addEventListener('mouseup', handleMouseUp);

		itemId = id;
		x = e.clientX;
		y = e.clientY;
		largeScreen.subscribe((value) => (vertical = !value));
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
			if (
				vertical
					? clientY > listRect.top && clientY < listRect.bottom
					: clientX > listRect.left && clientX < listRect.right
			) {
				const newDropzone = lists.indexOf(list);
				if (dropzone !== newDropzone) {
					dropzone = newDropzone;
					list.hovering = true;
					list.onHoverChange(true);
				}
			} else if (list.hovering) {
				list.hovering = false;
				list.onHoverChange(false);
			}
		}
	}

	function handleMouseUp() {
		window.removeEventListener('mousemove', handleMouseMove);
		window.removeEventListener('mouseup', handleMouseUp);

		dragging = false;
		node.setAttribute(
			'style',
			`
        transform: 0, 0;
        z-index: unset;
        cursor: unset;
      `
		);
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
	{
		onDrop,
		onHoverChange
	}: {
		onDrop: (id: string) => void;
		onHoverChange: (value: boolean) => void;
	}
) {
	const index = lists.length;
	lists.push({ node, hovering: false, onHoverChange });

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
