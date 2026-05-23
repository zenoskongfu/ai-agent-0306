import { ChatOpenAI } from "@langchain/openai";
import { getEnv } from "../env.js";
import { Annotation, END, START, StateGraph } from "@langchain/langgraph";

const globalEnv = getEnv();

// const aiClient = new ChatOpenAI({
//   model: globalEnv.model,
//   temperature: 0,
//   configuration: {
//     apiKey: globalEnv.apiKey,
//     baseURL: globalEnv.baseURL,
//   },
// })

type StateType = Record<string, unknown>;

const StateAnnotation = Annotation.Root({
	text: Annotation({
		reducer: (_prev, next) => _prev + next,
		default: () => "",
	}),
	name: Annotation({
		reducer: (_prev, next) => _prev + next,
		default: () => "",
	}),
});

const textNode1 = (state: StateType) => {
	return {
		text: ` --> text 1`,
	};
};
const textNode2 = (state: StateType) => {
	return {
		text: `--> text 2`,
		name: ` --> name 2`,
	};
};

const graph = new StateGraph(StateAnnotation)
	.addNode("textNode1", textNode1)
	.addNode("textNode2", textNode2)
	.addEdge(START, "textNode1")
	.addEdge("textNode1", "textNode2")
	.addEdge("textNode2", END)
	.compile();

const drawable = await graph.getGraphAsync();
const mermaid = await drawable.drawMermaid({ withStyles: true });

console.log(mermaid);

const result = await graph.invoke({ text: "text0", name: "name0" });

console.log("result: ", result);
