const lists: HTMLElement[] = [];
let itemId: string;
let dropzone: number;

export function drag(node: HTMLElement, id: string) {
	let x: number;
	let y: number;

	function handleMouseDown(e: MouseEvent) {
		itemId = id;
		window.addEventListener('mousemove', handleMouseMove);
		window.addEventListener('mouseup', handleMouseUp);
		x = e.clientX;
		y = e.clientY;
		e.currentTarget?.parentNode.setAttribute('style', 'overflow: visible; z-index: 1000;');
	}

	function handleMouseMove(e: MouseEvent) {
		const dx = e.clientX - x;
		const dy = e.clientY - y;
		node.setAttribute('style', `transform: translate(${dx}px, ${dy}px);`);
		// TODO: use for loop instead of forEach
		lists.forEach((list, index) => {
			const listRect = list.getBoundingClientRect();
			if (e.clientX > listRect.left && e.clientX < listRect.right) {
				dropzone = index;
			}
		});
	}

	function handleMouseUp(e: MouseEvent) {
		window.removeEventListener('mousemove', handleMouseMove);
		window.removeEventListener('mouseup', handleMouseUp);
	}

	node.addEventListener('mousedown', handleMouseDown);

	return {
		update() {},
		destroy() {
			node.removeEventListener('mousedown', handleMouseDown);
			window.removeEventListener('mousemove', handleMouseMove);
			window.removeEventListener('mouseup', handleMouseUp);
		}
	};
}

export function drop(node: HTMLElement, callback: (id: string) => void) {
	const index = lists.length;
	lists.push(node);
	console.log(lists, index);

	function handleMouseUp(e: MouseEvent) {
		if (index === dropzone) {
			callback(itemId);
		}
	}

	window.addEventListener('mouseup', handleMouseUp);

	return {
		update() {},
		destroy() {
			window.removeEventListener('mouseup', handleMouseUp);
		}
	};
}
