import axios from "axios";

type AliveResponse = { 
	alive: boolean;
	commitHash: string;
};

test("is alive route response", async () => {
	const url = "http://localhost:3001/is_alive";
	const response = await axios.get<AliveResponse>(url);
	const {
		data: { alive }
	} = response;

	expect(alive).toBeTruthy();
	expect(response.data);
});
