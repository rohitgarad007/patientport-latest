-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jun 25, 2025 at 11:04 AM
-- Server version: 10.4.13-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `mandir_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `uid` varchar(100) NOT NULL,
  `name` varchar(100) NOT NULL,
  `email` varchar(150) NOT NULL,
  `password` varchar(255) DEFAULT NULL,
  `google_id` varchar(255) DEFAULT NULL,
  `profile_picture` varchar(255) DEFAULT NULL,
  `currentPack` varchar(50) NOT NULL,
  `availableBalance` int(11) NOT NULL,
  `mobile` varchar(15) NOT NULL,
  `auth_provider` enum('email','google') NOT NULL DEFAULT 'email',
  `wstatus` int(2) NOT NULL,
  `isdelete` int(2) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `uid`, `name`, `email`, `password`, `google_id`, `profile_picture`, `currentPack`, `availableBalance`, `mobile`, `auth_provider`, `wstatus`, `isdelete`, `created_at`, `updated_at`) VALUES
(6, '5PN6pP4wUGaoegzgrdSJ5BOxPgL2', 'Umesh Jadhav', 'jadhavumakantltr@gmail.com', NULL, '100704829005383670010', 'https://lh3.googleusercontent.com/a/ACg8ocLEszyRa7wIW1HMWMfVPfF-j7R55-ETvQ-nCzFldJE9roNgog=s96-c', 'CODEAS4E8E2SE', 400, '', 'google', 1, 0, '2025-05-22 08:36:23', '2025-06-16 03:47:09'),
(11, 'pgRg928MmSentg0p0lq7QosQd1F3', 'Garad Rohit', 'rohitgarad007@gmail.com', 'c40a7d7a48c3af8bd7fb951b33489de2', '105236772265012608810', 'https://lh3.googleusercontent.com/a/ACg8ocISPXFkhGpyk0dANwCiKs4ZHquDh85_ud5n5XS5iCrd9QfMOoTT=s96-c', 'CODEAS4E8E2SE', 3254, '', 'google', 1, 0, '2025-05-26 13:31:44', '2025-06-17 07:41:49');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD UNIQUE KEY `google_id` (`google_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
