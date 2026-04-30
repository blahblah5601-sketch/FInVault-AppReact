-- FinVault Database Schema - Insert Missing Sample Data
-- Insert sample data for development (only missing data)

-- Insert budgets data
INSERT INTO budgets (user_id, name, amount, spent, start_date, end_date, category) VALUES
('c04d332e-d393-4356-a16a-b004bca8d226', 'Groceries Budget', 500.00, 350.00, CURRENT_DATE, CURRENT_DATE + INTERVAL '1 month', 'Groceries'),
('c04d332e-d393-4356-a16a-b004bca8d226', 'Entertainment Budget', 300.00, 275.00, CURRENT_DATE, CURRENT_DATE + INTERVAL '1 month', 'Entertainment');

-- Insert settings data
INSERT INTO settings (user_id, theme, compact_mode, show_iban_on_dashboard, show_balance_by_default, use_planet_icons, show_monthly_income_card, show_monthly_spend_card, show_envelope_items_by_default, use_visual_donut_view, budget_warning_threshold, require_confirmation_before_sending, save_card_details_for_session, show_tooltips_on_icon_buttons) VALUES
('c04d332e-d393-4356-a16a-b004bca8d226', 'light', false, true, true, true, true, true, true, true, 70, true, true, true);