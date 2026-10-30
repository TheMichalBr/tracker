// Zabrání zobrazení přebytečného okna příkazové řádky na Windows v release módu
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

fn main() {
    tracker_lib::run();
}
