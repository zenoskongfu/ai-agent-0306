import { Annotation, END, START, StateGraph } from "@langchain/langgraph";

type StateType = {
	query: string;
	answer: string;
};

const stateAnnotation = Annotation.Root({
	query: Annotation({
		reducer: (_prev, next: string) => next,
		default: () => "",
	}),
	route: Annotation({
		reducer: (_prev, next: string) => next,
		default: () => "",
	}),
	answer: Annotation({
		reducer: (_prev, next: string) => next,
		default: () => "",
	}),
});

const router = (state: StateType) => {
	const isMath = /[+\-*\/]/.test(state.query);

	return {
		route: isMath ? "math" : "chat",
	};
};

const mathNode = (state: StateType) => {
	try {
		return { answer: String(eval(state.query)) };
	} catch (error) {
		return {
			answer: "表达式无法计算",
		};
	}
};

const chatNode = (state: StateType) => {
	return {
		answer: `你说的是： ${state.query}`,
	};
};

const graph = new StateGraph(stateAnnotation)
	.addNode("router", router)
	.addNode("math", mathNode)
	.addNode("chat", chatNode)
	.addEdge(START, "router")
	.addConditionalEdges("router", (state) => state.route, {
		math: "math",
		chat: "chat",
	})
	.addEdge("math", END)
	.addEdge("chat", END)
	.compile();

// const drawable = graph.getGraphAsync();

// https://mermaid.live
const drawable = await graph.getGraphAsync();
const mermaid = drawable.drawMermaid({ withStyles: true });
console.log(mermaid);

const result = await graph.invoke({ query: "你啊后" });
console.log(result.answer);
