export default {
	async fetch(request: Request, env: any, ctx: ExecutionContext): Promise<Response> {
		const url = new URL(request.url);
		const path = url.pathname;
		const method = request.method.toUpperCase();
		const token = env.api_token;

		if (path === "/data/all" && method === "GET") {
			try {
				const result = await env.LINKS_DB.prepare("SELECT name, url FROM links").all();
				return new Response(
					JSON.stringify({ status: 200, message: "OK", links: result.records }),
					{
						status: 200,
						statusText: "OK",
						headers: {
							"Content-Type": "application/json",
							"Cache-Control": "no-store",
							"Access-Control-Allow-Origin": "*",
							"X-Content-Type-Options": "nosniff",
						},
					}
				);
			} catch (err: any) {
				return new Response(
					JSON.stringify({ status: 500, message: "Fatal Server Error" }),
					{
						status: 500,
						statusText: "Fatal Server Error",
						headers: {
							"Content-Type": "application/json",
							"Cache-Control": "no-store",
							"Access-Control-Allow-Origin": "*",
							"X-Content-Type-Options": "nosniff",
						},
					}
				);
			}
		}

		if (path === "/data/put" && method === "POST") {
			const authHeader = request.headers.get("Authorization") || "";
			if (!authHeader.startsWith("Bearer ") || authHeader.slice(7) !== token) {
				return new Response(
					JSON.stringify({ status: 401, message: "Unauthorized" }),
					{
						status: 401,
						statusText: "Unathorized",
						headers: {
							"Content-Type": "application/json",
							"Cache-Control": "no-store",
							"Access-Control-Allow-Origin": "*",
							"X-Content-Type-Options": "nosniff",
						},
					}
				);
			}

			let body: { name?: string; url?: string };
			try {
				body = await request.json();
			} catch {
				return new Response(
					JSON.stringify({ status: 400, message: "Invalid Data" }),
					{
						status: 400,
						statusText: "Invalid Data",
						headers: {
							"Content-Type": "application/json",
							"Cache-Control": "no-store",
							"Access-Control-Allow-Origin": "*",
							"X-Content-Type-Options": "nosniff",
						},
					}
				);
			}

			const { name, url: linkUrl } = body;
			if (!name || !linkUrl) {
				return new Response(
					JSON.stringify({ status: 400, message: "Missing Data" }),
					{
						status: 400,
						statusText: "Missing Data",
						headers: {
							"Content-Type": "application/json",
							"Cache-Control": "no-store",
							"Access-Control-Allow-Origin": "*",
							"X-Content-Type-Options": "nosniff",
						},
					}
				);
			}

			const nameRegex = /^[a-zA-Z0-9]+(?:_[a-zA-Z0-9]+)?$/;
			if (!nameRegex.test(name)) {
				return new Response(
					JSON.stringify({ status: 400, message: "Invalid name format" }),
					{
						status: 400,
						statusText: "Invalid Data",
						headers: {
							"Content-Type": "application/json",
							"Cache-Control": "no-store",
							"Access-Control-Allow-Origin": "*",
							"X-Content-Type-Options": "nosniff",
						},
					}
				);
			}

			let parsedUrl: URL;
			try {
				parsedUrl = new URL(linkUrl);
			} catch {
				return new Response(
					JSON.stringify({ status: 400, message: "Invalid URL" }),
					{
						status: 400,
						statusText: "Invalid Data",
						headers: {
							"Content-Type": "application/json",
							"Cache-Control": "no-store",
							"Access-Control-Allow-Origin": "*",
							"X-Content-Type-Options": "nosniff",
						},
					}
				);
			}

			try {
				await env.LINKS_DB.prepare("INSERT INTO links (name, url) VALUES (?, ?)").bind(name, parsedUrl.toString()).run();
				const reUrl = `https://go.roax.world/${name}`;
				return new Response(
					JSON.stringify({ status: 201, message: "OK", name: name, url: parsedUrl.toString(), reUrl: reUrl }),
					{
						status: 201,
						statusText: "OK",
						headers: {
							"Content-Type": "application/json",
							"Cache-Control": "no-store",
							"Access-Control-Allow-Origin": "*",
							"X-Content-Type-Options": "nosniff",
						},
					}
				);
			} catch {
				return new Response(
					JSON.stringify({ status: 500, message: "Unable to process request" }),
					{
						status: 500,
						statusText: "Unable to process request",
						headers: {
							"Content-Type": "application/json",
							"Cache-Control": "no-store",
							"Access-Control-Allow-Origin": "*",
							"X-Content-Type-Options": "nosniff",
						},
					}
				);
			}
		}

		return new Response(
			JSON.stringify({ status: 404, message: "Not Found" }),
			{
				status: 404,
				statusText: "Not Found",
				headers: {
					"Content-Type": "application/json",
					"Cache-Control": "no-store",
					"Access-Control-Allow-Origin": "*",
					"X-Content-Type-Options": "nosniff",
				},
			}
		);
	}
};
