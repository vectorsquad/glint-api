import app from "../main";
import request from "supertest";
import { col } from "../utils";

describe('insert', () => {
  var deck_id= "";
  var card_id= "";

  test('Tests register user', async() => {
    await col("user").findOneAndDelete({
      "username": "test"
    });

    const body = {
      "username": "test",
      "password_hash": "test",
      "email": "test",
      "name_first": "test",
      "name_last": "test"
    }

    const response = await request(app)
      .post("/api/v1/register")
      .send(body)
      .set({
        "Content-Type": "application/json",
      });

      expect(response.statusCode).toBe(200);
  });

  test('Tests login user', async() => {
    await col("user").findOneAndUpdate(
      {
        "username": "test"
      },
      {
        $set:{ "email_verified": true }
      }
    );
    
    const body = {
      "login" : {
        "username": "test",
        "password_hash": "test"
      }
    }

    const response = await request(app)
      .post("/api/v1/login")
      .send(body)
      .set({
        "Content-Type": "application/json",
      });

      expect(response.statusCode).toBe(204);
  });

 

  test('Tests create deck', async () => {

   await col("deck").findOneAndDelete({
     "name": "test deck"
    });
    
    const body = {
      "deck_name":"test deck"
    };

    const response = await request(app)
      .post("/api/v1/createDeck")
      .send(body)
      .set({
        "Content-Type": "application/json",
      });

      deck_id = response.body['id'];
      expect(response.statusCode).toBe(200);
    });

  test('Tests create card', async () => {
    
    await col("card").findOneAndDelete({"id_deck":"test deck", "side_front":"test", "side_back":"test"});

    const body = {
      "id_deck": deck_id,
      "side_front":"test",
      "side_back": "test"
    };

    const response = await request(app)
      .post("/api/v1/create")
      .send(body)
      .set({
        "Content-Type": "application/json",
      });

      let resp_uuid = response.body;

      expect(resp_uuid).toBeTruthy();
      expect(response.statusCode).toBe(200);
    });


    test('Tests find card', async () => {
        
        const body = {
          "side_front":"test",
          "side_back": "test"
        };

        const response = await request(app)
          .post("/api/v1/find")
          .send(body)
          .set({
            "Content-Type": "application/json",
          });

        let resp_uuid = response.body;

        expect(resp_uuid).toBeTruthy();
        card_id = resp_uuid;
        expect(response.statusCode).toBe(200);
      });

    test('Tests delete card', async () => {
        
      const body = {
        "id": card_id
      };

      const response = await request(app)
        .post("/api/v1/delete")
        .send(body)
        .set({
          "Content-Type": "application/json",
        });

      
      expect(response.statusCode).toBe(204);
    });

    test('Tests find deck', async () => {
        
      const body = {
        "deck_name": "test deck"
      };

      const response = await request(app)
        .post("/api/v1/findDeck")
        .send(body)
        .set({
          "Content-Type": "application/json",
        });

      
      expect(response.statusCode).toBe(200);
    });

    test('Tests delete deck', async () => {
        
      const body = {
        "id": deck_id
      };

      const response = await request(app)
        .post("/api/v1/deleteDeck")
        .send(body)
        .set({
          "Content-Type": "application/json",
        });

      
      expect(response.statusCode).toBe(204);
    });   
});