-- MySQL Script generated by MySQL Workbench
-- 07/07/19 12:44:24
-- Model: New Model    Version: 1.0
-- MySQL Workbench Forward Engineering

SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='TRADITIONAL,ALLOW_INVALID_DATES';

-- -----------------------------------------------------
-- Schema COPY_DB
-- -----------------------------------------------------

-- -----------------------------------------------------
-- Schema COPY_DB
-- -----------------------------------------------------
CREATE SCHEMA IF NOT EXISTS `COPY_DB` DEFAULT CHARACTER SET utf8 COLLATE utf8_general_ci ;
USE `COPY_DB` ;

-- -----------------------------------------------------
-- Table `COPY_DB`.`submissions`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `COPY_DB`.`submissions` (
  `id` VARCHAR(30) NOT NULL COMMENT '',
  `title` MEDIUMTEXT NOT NULL COMMENT '',
  PRIMARY KEY (`id`)  COMMENT '')
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `COPY_DB`.`config`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `COPY_DB`.`config` (
  `AuthTkn` VARCHAR(50) NOT NULL DEFAULT 'tkn' COMMENT '',
  `Debug` TINYINT(1) NOT NULL DEFAULT 0 COMMENT '',
  `DebugServer` VARCHAR(50) NOT NULL DEFAULT 'server' COMMENT '',
  `IntervalTimeInSeconds` INT NOT NULL DEFAULT 100 COMMENT '',
  `User_Agent` VARCHAR(45) NOT NULL DEFAULT 'agent' COMMENT '',
  `Client_Id` VARCHAR(45) NOT NULL DEFAULT 'id' COMMENT '',
  `Client_Secret` VARCHAR(45) NOT NULL DEFAULT 'secret' COMMENT '',
  `Username` VARCHAR(45) NOT NULL DEFAULT 'username' COMMENT '',
  `Password` VARCHAR(45) NOT NULL DEFAULT 'password' COMMENT '',
  `MinUpVotes` INT NOT NULL DEFAULT 10 COMMENT '',
  `PostLimit` INT NOT NULL DEFAULT 10 COMMENT '',
  `MessageLimit` INT NOT NULL DEFAULT 2000 COMMENT '',
  `PageSize` INT NOT NULL DEFAULT 10 COMMENT '',
  `LogOffMessages` VARCHAR(100) NOT NULL DEFAULT '[]' COMMENT '',
  `CensorMode` TINYINT(1) NOT NULL DEFAULT 0 COMMENT '')
ENGINE = InnoDB;


SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;
