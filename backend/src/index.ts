export default {
	async fetch(request: Request, env: any, ctx: ExecutionContext): Promise<Response> {
		const url = new URL(request.url);
		const path = url.pathname;
		const method = request.method.toUpperCase();

		const DEMO_TOKEN = "demo-static-token"; // temp solution dont hate me x

		if (path === "/all" && method === "GET") {
			try {
				const result = await env.LINKS_DB.prepare("SELECT name, url FROM links").all();
				return new Response(JSON.stringify(result.results), {
					status: 200,
					headers: { "Content-Type": "application/json" }
				});
			} catch (err: any) {
				return new Response(JSON.stringify({ error: "Failed to fetch links", details: err.message }), {
					status: 500,
					headers: { "Content-Type": "application/json" }
				});
			}
		}

		if (path === "/put" && method === "POST") {
			// Basic token auth
			const authHeader = request.headers.get("Authorization") || "";
			if (!authHeader.startsWith("Bearer ") || authHeader.slice(7) !== DEMO_TOKEN) {
				return new Response(JSON.stringify({ error: "Unauthorized" }), {
					status: 401,
					headers: { "Content-Type": "application/json" }
				});
			}

			let body: { name?: string; url?: string };
			try {
				body = await request.json();
			} catch {
				return new Response(JSON.stringify({ error: "Invalid JSON" }), {
					status: 400,
					headers: { "Content-Type": "application/json" }
				});
			}

			const { name, url: linkUrl } = body;
			if (!name || !linkUrl) {
				return new Response(JSON.stringify({ error: "Missing 'name' or 'url'" }), {
					status: 400,
					headers: { "Content-Type": "application/json" }
				});
			}

			try {
				await env.LINKS_DB.prepare("INSERT INTO links (name, url) VALUES (?, ?)").bind(name, linkUrl).run();
				return new Response(JSON.stringify({ status: "success", name, url: linkUrl }), {
					status: 201,
					headers: { "Content-Type": "application/json" }
				});
			} catch (err: any) {
				return new Response(JSON.stringify({ error: "Failed to insert", details: err.message }), {
					status: 500,
					headers: { "Content-Type": "application/json" }
				});
			}
		}

		return new Response(JSON.stringify({ error: "Endpoint not found" }), {
			status: 404,
			headers: { "Content-Type": "application/json" }
		});
	}
};
