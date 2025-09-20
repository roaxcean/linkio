export default {
	async fetch(request, env, ctx): Promise<Response> {
		const url = new URL(request.url);
		const path = url.pathname.replace(/^\/+/, "");

		if (!path) {
			return new Response(
				JSON.stringify({status: 400, message: "Missing Path"}),
				{ status: 400, statusText: "Missing Path", headers: {
						"Content-Type": "application/json",
						"Cache-Control": "no-store",
						"Access-Control-Allow-Origin": "*",
						"X-Content-Type-Options": "nosniff"
					} }
			);
		}

		const nameRegex = /^[a-zA-Z0-9]+(?:_[a-zA-Z0-9]+)?$/;
		if (!nameRegex.test(path)) {
			return new Response(
				JSON.stringify({ status: 400, message: "Invalid Path Format" }),
				{
					status: 400,
					statusText: "Invalid Path Format",
					headers: {
						"Content-Type": "application/json",
						"Cache-Control": "no-store",
						"Access-Control-Allow-Origin": "*",
						"X-Content-Type-Options": "nosniff",
					},
				}
			);
		}

		const result = await env.LINKS_DB.prepare(
			"SELECT url FROM links WHERE name = ?1 LIMIT 1"
		).bind(path.toLowerCase()).first();

		if (!result) {
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

		try {
			// @ts-ignore ; TS2345 shut up, this is a test env
			new URL(result.url);
		} catch {
			return new Response(
				JSON.stringify({ status: 500, message: "Invalid URL in Database" }),
				{
					status: 500,
					statusText: "Invalid URL in Database",
					headers: {
						"Content-Type": "application/json",
						"Cache-Control": "no-store",
						"Access-Control-Allow-Origin": "*",
						"X-Content-Type-Options": "nosniff",
					},
				}
			);
		}

		// @ts-ignore ; TS2345 cant happen here (db is sanitized, plus checks are above)
		return Response.redirect(result.url, 302);
	},
} satisfies ExportedHandler<Env>;
