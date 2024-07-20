import app from "../main";
import request from "supertest";

test('Tests find card', async () => {
    
    const body = {
      "side_front":"front mess",
      "side_back": "back"
    };

    const response = await request(app)
      .post("/api/v1/find")
      .send(body)
      .set({
        "Content-Type": "application/json",
      });

    let resp_uuid = response.body;

    expect(resp_uuid).toBeTruthy();
    expect(response.statusCode).toBe(200);
  });