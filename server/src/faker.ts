import { faker } from "@faker-js/faker";
import dbConnect from "./config/database";
import Item from "./models/Item";
import User from "./models/User";
import Category from "./models/Category";
import RatingAndReview from "./models/RatingAndReview";

const users = [
  [
    "679269316826dbbd08bb1013",
    "679269316826dbbd08bb1011",
    [
      "67934bbfc41f12456b808ce0",
      "67934bc0c41f12456b808cf8",
      "67934bc2c41f12456b808d13",
      "67934bc3c41f12456b808d29",
      "67934bc5c41f12456b808d51",
      "67934bc6c41f12456b808d6d",
      "67934bc8c41f12456b808d89",
      "67934bc9c41f12456b808da5",
      "67934bccc41f12456b808dc1",
      "67934bcec41f12456b808ddd",
      "67934bcfc41f12456b808df9",
    ],
  ],
  [
    "67929951c7b2e0e32fc87d68",
    "67929951c7b2e0e32fc87d66",
    [
      "67934bbfc41f12456b808ce1",
      "67934bc0c41f12456b808cfd",
      "67934bc2c41f12456b808d1b",
      "67934bc4c41f12456b808d41",
      "67934bc6c41f12456b808d59",
      "67934bc7c41f12456b808d75",
      "67934bc9c41f12456b808d91",
      "67934bcac41f12456b808dad",
      "67934bccc41f12456b808dc9",
      "67934bcec41f12456b808de5",
      "67934bd0c41f12456b808e01",
    ],
  ],
  [
    "679299bdc7b2e0e32fc87d72",
    "679299bdc7b2e0e32fc87d70",
    [
      "67934bbfc41f12456b808ce2",
      "67934bc0c41f12456b808cfa",
      "67934bc2c41f12456b808d0f",
      "67934bc4c41f12456b808d3d",
      "67934bc6c41f12456b808d5e",
      "67934bc8c41f12456b808d7a",
      "67934bc9c41f12456b808d95",
      "67934bcbc41f12456b808db3",
      "67934bcdc41f12456b808dcf",
      "67934bcec41f12456b808ded",
      "67934bd0c41f12456b808e07",
    ],
  ],
  [
    "67929a01c7b2e0e32fc87d7c",
    "67929a01c7b2e0e32fc87d7a",
    [
      "67934bbfc41f12456b808ce3",
      "67934bc0c41f12456b808cff",
      "67934bc2c41f12456b808d19",
      "67934bc3c41f12456b808d30",
      "67934bc5c41f12456b808d45",
      "67934bc6c41f12456b808d61",
      "67934bc8c41f12456b808d7d",
      "67934bc9c41f12456b808d99",
      "67934bcbc41f12456b808db5",
      "67934bcdc41f12456b808dd1",
      "67934bcec41f12456b808deb",
    ],
  ],
  [
    "67929a3cc7b2e0e32fc87d86",
    "67929a3cc7b2e0e32fc87d84",
    [
      "67934bbfc41f12456b808ce4",
      "67934bc0c41f12456b808d01",
      "67934bc2c41f12456b808d1d",
      "67934bc3c41f12456b808d32",
      "67934bc5c41f12456b808d55",
      "67934bc7c41f12456b808d71",
      "67934bc8c41f12456b808d8d",
      "67934bcac41f12456b808da9",
      "67934bccc41f12456b808dc5",
      "67934bcec41f12456b808de1",
      "67934bcfc41f12456b808dfd",
    ],
  ],
  [
    "67929a8ac7b2e0e32fc87d90",
    "67929a8ac7b2e0e32fc87d8e",
    [
      "67934bbfc41f12456b808ce5",
      "67934bc0c41f12456b808d07",
      "67934bc2c41f12456b808d23",
      "67934bc3c41f12456b808d36",
      "67934bc5c41f12456b808d4a",
      "67934bc6c41f12456b808d66",
      "67934bc8c41f12456b808d82",
      "67934bc9c41f12456b808d9d",
      "67934bcbc41f12456b808dbd",
      "67934bcec41f12456b808ddb",
      "67934bcfc41f12456b808df5",
    ],
  ],
  [
    "67929aedc7b2e0e32fc87d9e",
    "67929aedc7b2e0e32fc87d9c",
    [
      "67934bbfc41f12456b808ce6",
      "67934bc1c41f12456b808d09",
      "67934bc2c41f12456b808d25",
      "67934bc3c41f12456b808d39",
      "67934bc5c41f12456b808d4d",
      "67934bc6c41f12456b808d69",
      "67934bc8c41f12456b808d85",
      "67934bc9c41f12456b808da1",
      "67934bcbc41f12456b808dbf",
      "67934bcdc41f12456b808dd5",
      "67934bcfc41f12456b808df1",
    ],
  ],
];

const categories = [
  "6792725936d1a6680cdadecf",
  "6792728636d1a6680cdaded7",
  "6792729036d1a6680cdadedb",
  "679272af36d1a6680cdadee9",
  "6792734494eb5af389e1dc1f",
];

dbConnect()
  .then(() => {
    async function createItem(i: number) {
      for (let j = 0; j <= 10; j++) {
        const price: number = parseInt(faker.commerce.price());
        const item = await Item.create({
          name: faker.commerce.productName(),
          description: faker.commerce.productDescription(),
          price: price,
          depositAmount: price * 2,
          category: categories[Math.floor(Math.random() * categories.length)],
          tags: [
            faker.commerce.productMaterial(),
            faker.commerce.productMaterial(),
            faker.commerce.productMaterial(),
            faker.commerce.productMaterial(),
          ],
          lenderId: users[i][0],
          borrowers: [],
          ratingAndReviews: [],
          isAvailable: true,
          images: [
            faker.image.urlLoremFlickr(),
            faker.image.urlLoremFlickr(),
            faker.image.urlLoremFlickr(),
            faker.image.urlLoremFlickr(),
          ],
          condition: "New",
          currentBorrowerId: undefined,
          availableFrom: faker.date.between({
            from: "2025-01-25T00:00:00.000Z",
            to: "2030-01-01T00:00:00.000Z",
          }),
          deliveryCharges: faker.commerce.price(),
          deliveryType: "Both (Pickup & Delivery)",
          deliveryRadius: 10,
          itemLocation: users[i][1],
        });

        await User.findByIdAndUpdate(users[i][0], {
          $push: { lendItems: item._id },
        });

        await Category.findByIdAndUpdate(item.category, {
          $inc: {
            itemCount: 1,
          },
          $push: {
            items: item._id,
          },
        });

        console.log("Item created", item._id);
      }
    }

    async function createRating() {
      for (let i = 0; i < users.length; i++) {
        // represents the reviewer
        for (let j = 0; j < users.length; j++) {
          // represents the other users
          for (let k = 0; k < users[j][2].length; k++) {
            // represents the items of the other users
            if (i == j) {
              break;
            }

            const rr = await RatingAndReview.create({
              rating: faker.number.float({
                min: 1,
                max: 5,
                multipleOf: 0.5,
              }),
              review: faker.lorem.sentence(),
              reviewer: users[i][0],
              toWhom: users[j][2][k],
              type: "Item",
            });

            await Item.findByIdAndUpdate(users[j][2][k], {
              $push: {
                ratingAndReviews: rr._id,
              },
            });
          }
        }
      }

      console.log("All ratings created");
    }

    createRating();

    // for (let i = 0; i < users.length; i++) {
    //   createItem(i);
    // }
  })
  .catch(() => {
    console.log("Database connection error");
  });
