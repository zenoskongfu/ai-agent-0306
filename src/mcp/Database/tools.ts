import { carts, users } from "./data.js";

export const findUserById = (userId: string) => {
	// 判断userId是否存在
	if (!userId) {
		return `userId is required.`;
	}
	// 判断user是否存在
	const user = users.find((user) => user.id === userId);
	if (!user) {
		return `User with id ${userId} not found.`;
	}
	return `找到用户：${user.id}，用户信息为：${JSON.stringify(user)}`;
};

export const findCartByUserId = (userId: string) => {
	// 判断userId是否存在
	if (!userId) {
		return `userId is required.`;
	}
	// 判断user是否存在
	const user = users.find((user) => user.id === userId);
	if (!user) {
		return `User with id ${userId} not found.`;
	}
	// 找出对应的购物车信息
	const cart = carts.find((cart) => cart.userId === userId);
	if (!cart) {
		return `Cart for user with id ${userId} not found.`;
	}

	return `找到用户：${user.id}，用户的购物车信息为：${JSON.stringify(cart)}`;
};
