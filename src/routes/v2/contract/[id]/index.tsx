import { component$ } from "@builder.io/qwik";
import { useLoadContract } from "./layout";
import Debugger from "~/components/debugger";

export default component$(() => {
	const contract = useLoadContract();

	return <Debugger value={contract.value}></Debugger>;
});
