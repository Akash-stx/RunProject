# Change Log

All notable changes to the "LaunchBoard" extension will be documented in this file.

Check [Keep a Changelog](http://keepachangelog.com/) for recommendations on how to structure this file.

## [Unreleased] - [0.0.12]


## [0.0.11] - 2024-11-5
- added support to stop and restart actions.
- bug fixes.

## [0.0.10] - 2024-11-5
- Added support for adding multiple actions in JSON format within the create form, allowing for quicker setup of multiple tasks.
- Users can now export all saved actions as JSON for easy sharing. These actions can be imported on other devices or by other users via the bulk import feature
- A new option to restart any currently running project for a seamless workflow.

## [0.0.9] - 2024-11-1
- Introduced a dedicated side icon for easy access to the Import Plus screen.
- Expanded functionality to include additional features beyond just importing.
- Implemented an easy project startup feature using commands for quicker initialization.

## [0.0.8] - 2024-10-31
- added support to import on jsx element on React

### Fixed
- Resolved the issue where the new default key was getting lost during default updates on same import
- Fixed a bug that caused issues when trying to add a selected import that wasn't present in the document

## [0.0.7] - 2024-10-31

### Fixed
- fixed issue with default import on import
- fixed child imports being added on a new line, instead of appending to the existing import statement

## [0.0.6] - 2024-10-29

- Enhanced import suggestions to display the source as "from Import Plus" alongside the import path.
- Improved visibility of suggestions to help users easily identify which imports are provided by the extension.

## [0.0.5] - 2024-10-25

- Bug fix

## [0.0.4] - 2024-10-22

- Bug fix

## [0.0.3] - 2024-10-21

- updated readme

## [0.0.2] - 2024-10-20

### Added

- Enhanced functionality to allow adding imports to any open file using `Ctrl + Space`.
- Improved import suggestion behavior to align with the current file context.

## [0.0.1] - 2024-10-18

### Added

- Initial release of the extension.
- Basic support for selecting and adding multiple import lines to files using the command `Ctrl + Shift + L`.
