use actix_web::{web, App, HttpServer, Responder, HttpRequest, HttpResponse};
use serde::Serialize;

#[derive(Serialize)]
struct ApiResponse {
    message: String,
}

async fn handle_request(req: HttpRequest) -> impl Responder {
    let connection_info = req.connection_info();
    let remote_addr = connection_info.remote_addr().unwrap_or("unknown");

    if is_ip_approved(remote_addr) {
        // Code to retrieve and send the API key
        HttpResponse::Ok().json(ApiResponse { message: "59db9980-98dc-4851-b81c-9254ac494e92".to_string() })
    } else {
        HttpResponse::Forbidden().json(ApiResponse { message: "Access Denied".to_string() })
    }
}

fn is_ip_approved(ip: &str) -> bool {
    // Implement your logic to check if the IP is approved
    true // Placeholder
}

#[actix_rt::main]
async fn main() -> std::io::Result<()> {
    HttpServer::new(|| {
        App::new()
            .route("/", web::get().to(handle_request))
    })
    .bind("127.0.0.1:8080")?
    .run()
    .await
}
