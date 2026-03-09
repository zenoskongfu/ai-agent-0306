export const users = [
	{
		id: "1",
		name: "Alice",
		email: "YHl0F@example.com",
		password: "password1",
	},
	{
		id: "2",
		name: "Bob",
		email: "0HwYU@example.com",
		password: "password2",
	},
	{
		id: "3",
		name: "Charlie",
		email: "2H7tK@example.com",
		password: "password3",
	},
];

// 购物车数据, 每个用户一个购物车，购物车里有多个商品，每个商品有id、name、price、quantity等属性
export const carts = [
	{
		userId: "1",
		items: [
			{
				id: "1",
				name: "Apple",
				price: 1.0,
				quantity: 3,
			},
			{
				id: "2",
				name: "Banana",
				price: 0.5,
				quantity: 5,
			},
		],
	},
	{
		userId: "2",
		items: [
			{
				id: "3",
				name: "Orange",
				price: 0.8,
				quantity: 2,
			},
			{
				id: "5",
				name: "Orange plus",
				price: 8,
				quantity: 2,
			},
		],
	},
	{
		userId: "3",
		items: [
			{
				id: "4",
				name: "Grapes",
				price: 2.0,
				quantity: 1,
			},
		],
	},
];
