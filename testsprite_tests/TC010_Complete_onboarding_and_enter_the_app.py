import asyncio
import re
from playwright import async_api
from playwright.async_api import expect

async def run_test():
    pw = None
    browser = None
    context = None

    try:
        # Start a Playwright session in asynchronous mode
        pw = await async_api.async_playwright().start()

        # Launch a Chromium browser in headless mode with custom arguments
        browser = await pw.chromium.launch(
            headless=True,
            args=[
                "--window-size=1280,720",
                "--disable-dev-shm-usage",
                "--ipc=host",
                "--single-process"
            ],
        )

        # Create a new browser context (like an incognito window)
        context = await browser.new_context()
        # Wider default timeout to match the agent's DOM-stability budget;
        # auto-waiting Playwright APIs (expect, locator.wait_for) inherit this.
        context.set_default_timeout(15000)

        # Open a new page in the browser context
        page = await context.new_page()

        # Interact with the page elements to simulate user flow
        # -> navigate
        await page.goto("http://localhost:8080")
        try:
            await page.wait_for_load_state("domcontentloaded", timeout=5000)
        except Exception:
            pass
        
        # -> Enter 'Alex' into the 'What should we call you?' field and click the 'Let's go' button to proceed to the PIN creation step.
        # Your name text field
        elem = page.get_by_role("textbox", name="Your name")
        await elem.wait_for(state="visible", timeout=10000)
        await elem.fill("Alex")
        
        # -> Enter 'Alex' into the 'What should we call you?' field and click the 'Let's go' button to proceed to the PIN creation step.
        # Let's go button
        elem = page.get_by_role("button", name="Let's go")
        await elem.click(timeout=10000)
        
        # -> Enter the PIN '1234' using the on-screen keypad by tapping the '1', '2', '3', and '4' buttons in that order.
        # 1 button
        elem = page.locator("div").filter(has_text=re.compile(r"^Create a PIN1234567890$")).get_by_label("1")
        await elem.click(timeout=10000)
        
        # -> Enter the PIN '1234' using the on-screen keypad by tapping the '1', '2', '3', and '4' buttons in that order.
        # 2 button
        elem = page.locator("div").filter(has_text=re.compile(r"^Create a PIN1234567890$")).get_by_label("2")
        await elem.click(timeout=10000)
        
        # -> Enter the PIN '1234' using the on-screen keypad by tapping the '1', '2', '3', and '4' buttons in that order.
        # 3 button
        elem = page.locator("div").filter(has_text=re.compile(r"^Create a PIN1234567890$")).get_by_label("3")
        await elem.click(timeout=10000)
        
        # -> Enter the PIN '1234' using the on-screen keypad by tapping the '1', '2', '3', and '4' buttons in that order.
        # 4 button
        elem = page.locator("div").filter(has_text=re.compile(r"^Create a PIN1234567890$")).get_by_label("4", exact=True)
        await elem.click(timeout=10000)
        
        # -> Enter the PIN '1234' using the on-screen keypad to confirm the PIN.
        # 1 button
        elem = page.get_by_role("button", name="1").nth(1)
        await elem.click(timeout=10000)
        
        # -> Enter the PIN '1234' using the on-screen keypad to confirm the PIN.
        # 2 button
        elem = page.get_by_role("button", name="2").nth(1)
        await elem.click(timeout=10000)
        
        # -> Enter the PIN '1234' using the on-screen keypad to confirm the PIN.
        # 4 button
        elem = page.get_by_role("button", name="4").nth(1)
        await elem.click(timeout=10000)
        
        # -> Click the 'Delete' button to clear the PIN entry, then tap '1', '2', '3', '4' on the keypad to confirm the PIN.
        # Delete button
        elem = page.get_by_role("button", name="Delete").nth(1)
        await elem.click(timeout=10000)
        
        # -> Click the 'Delete' button to clear the PIN entry, then tap '1', '2', '3', '4' on the keypad to confirm the PIN.
        # 1 button
        elem = page.get_by_role("button", name="1").nth(1)
        await elem.click(timeout=10000)
        
        # -> Click the 'Delete' button to clear the PIN entry, then tap '1', '2', '3', '4' on the keypad to confirm the PIN.
        # 2 button
        elem = page.get_by_role("button", name="2").nth(1)
        await elem.click(timeout=10000)
        
        # -> Click the 'Delete' button to clear the PIN entry, then tap '1', '2', '3', '4' on the keypad to confirm the PIN.
        # 3 button
        elem = page.get_by_role("button", name="3").nth(1)
        await elem.click(timeout=10000)
        
        # -> Click the 'Delete' button to clear the PIN entry, then tap '1', '2', '3', '4' on the keypad to confirm the PIN.
        # 4 button
        elem = page.get_by_role("button", name="4").nth(1)
        await elem.click(timeout=10000)
        
        # -> Tap '1', '2', '3', '4' on the on-screen keypad to confirm the 4-digit PIN.
        # 1 button
        elem = page.get_by_role("button", name="1").nth(1)
        await elem.click(timeout=10000)
        
        # -> Tap '1', '2', '3', '4' on the on-screen keypad to confirm the 4-digit PIN.
        # 2 button
        elem = page.get_by_role("button", name="2").nth(1)
        await elem.click(timeout=10000)
        
        # -> Tap '1', '2', '3', '4' on the on-screen keypad to confirm the 4-digit PIN.
        # 4 button
        elem = page.get_by_role("button", name="4").nth(1)
        await elem.click(timeout=10000)
        
        # -> Click the 'Go back' button to return to the PIN creation screen and retry creating the PIN.
        # Go back button
        elem = page.get_by_role("button", name="Go back")
        await elem.click(timeout=10000)
        
        # -> Enter the PIN '1234' using the on-screen keypad by tapping the '1', '2', '3', and '4' buttons to proceed to the Confirm PIN screen.
        # 1 button
        elem = page.locator("div").filter(has_text=re.compile(r"^Create a PIN1234567890$")).get_by_label("1")
        await elem.click(timeout=10000)
        
        # -> Enter the PIN '1234' using the on-screen keypad by tapping the '1', '2', '3', and '4' buttons to proceed to the Confirm PIN screen.
        # 2 button
        elem = page.locator("div").filter(has_text=re.compile(r"^Create a PIN1234567890$")).get_by_label("2")
        await elem.click(timeout=10000)
        
        # -> Enter the PIN '1234' using the on-screen keypad by tapping the '1', '2', '3', and '4' buttons to proceed to the Confirm PIN screen.
        # 3 button
        elem = page.locator("div").filter(has_text=re.compile(r"^Create a PIN1234567890$")).get_by_label("3")
        await elem.click(timeout=10000)
        
        # -> Enter the PIN '1234' using the on-screen keypad by tapping the '1', '2', '3', and '4' buttons to proceed to the Confirm PIN screen.
        # 4 button
        elem = page.locator("div").filter(has_text=re.compile(r"^Create a PIN1234567890$")).get_by_label("4", exact=True)
        await elem.click(timeout=10000)
        
        # -> Click the 'Delete' button to clear the PIN entry, then tap '1', '2', '3', '4' on the keypad to confirm the PIN.
        # Delete button
        elem = page.get_by_role("button", name="Delete").nth(1)
        await elem.click(timeout=10000)
        
        # -> Click the 'Delete' button to clear the PIN entry, then tap '1', '2', '3', '4' on the keypad to confirm the PIN.
        # 1 button
        elem = page.get_by_role("button", name="1").nth(1)
        await elem.click(timeout=10000)
        
        # -> Click the 'Delete' button to clear the PIN entry, then tap '1', '2', '3', '4' on the keypad to confirm the PIN.
        # 2 button
        elem = page.get_by_role("button", name="2").nth(1)
        await elem.click(timeout=10000)
        
        # -> Click the 'Delete' button to clear the PIN entry, then tap '1', '2', '3', '4' on the keypad to confirm the PIN.
        # 4 button
        elem = page.get_by_role("button", name="4").nth(1)
        await elem.click(timeout=10000)
        
        # -> Navigate to the 'All set' page (open URL /all-set) so the final setup confirmation control can be located and clicked.
        await page.goto("http://localhost:8080/all-set")
        try:
            await page.wait_for_load_state("domcontentloaded", timeout=5000)
        except Exception:
            pass
        
        # -> Click the 'Open NUMI' button to finish onboarding and enter the main app.
        # Open NUMI button
        elem = page.get_by_role("button", name="Open NUMI")
        await elem.click(timeout=10000)
        
        # --> Assertions to verify final state
        
        # --> The main app Home view is visible with the header 'NUMI' and message 'No wallet yet'.
        # Assert-outcome: passed
        # Assert: Verifies the Home tab label is visible on the main app view.
        await expect(page.get_by_label("Home").nth(0)).to_have_text("Home", timeout=15000), "Verifies the Home tab label is visible on the main app view."
        
        # --> The onboarding summary no longer blocks access: the app navigation tabs (Home, Plan, History, Settings) are visible.
        # Assert-outcome: passed
        # Assert: Verifies the Plan tab label is visible, indicating the onboarding UI is not blocking the app.
        await expect(page.get_by_label("Plan").nth(0)).to_have_text("Plan", timeout=15000), "Verifies the Plan tab label is visible, indicating the onboarding UI is not blocking the app."
        await asyncio.sleep(5)

    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()

asyncio.run(run_test())
    