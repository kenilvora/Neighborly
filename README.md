# Neighbourly: Peer-to-Peer Item Rental Platform

## Overview

This project is a peer-to-peer item rental platform that enables users to lend and borrow items within a community. It promotes sustainability by encouraging sharing over ownership. Users can list items for rent, browse available items, and manage transactions securely. The platform ensures user verification and provides a transparent rating and review system.

## Features

- **User Authentication**: Secure sign-up and login functionality with government ID verification.
- **Item Listing**: Users can list items for rent, specifying details like name, description, price, and availability.
- **Borrowing System**: Borrowers can view items, check availability, and rent items for a specified duration.
- **Rating & Reviews**: Transparent feedback system for both lenders and borrowers.
- **Notifications**: Real-time updates for transactions, disputes, and other important events.
- **Transactions**: Secure payment handling with UPI integration and account balance management.
- **Dispute Resolution**: A mechanism to handle disputes between users.

## Database Schema

The platform is backed by a robust database design that includes the following key tables:

- **User**: Stores user information, including government ID and verification status.
- **Profile**: Manages user-specific data like borrowed and lent items, UPI details, and account balance.
- **Address**: Stores user addresses for identity verification.
- **Item**: Contains details of items listed for rent.
- **BorrowItem**: Tracks rental transactions, including borrowing duration and payment.
- **Transaction**: Logs financial transactions related to rentals.
- **Notification**: Handles real-time user notifications.
- **Dispute**: Manages disputes with reasons and resolution statuses.
- **RatingAndReview**: Stores feedback for users and items.

## Tech Stack

- **Frontend**: React.js (for user interface)
- **Backend**: Node.js with Express.js (for API development)
- **Database**: PostgreSQL
- **Authentication**: JWT-based authentication
- **Payments**: UPI integration

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository.
2. Create a new branch for your feature/bugfix.
3. Commit your changes and push them to your fork.
4. Submit a pull request with a detailed description of your changes.
