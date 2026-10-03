import { expect, test, Page } from "@playwright/test";

const isMobile = (page: Page) => (page.viewportSize()?.width ?? 1000) < 1024;

async function openActivity(page: Page, name: RegExp) {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /¿Qué quieres crear hoy\?/ })).toBeVisible();
  await page.getByRole("button", { name }).click();
  await expect(page).toHaveURL(/tab=studio/);
}

async function showPreview(page: Page) {
  if (isMobile(page)) await page.getByRole("radio", { name: /Ver hoja/ }).click();
}

async function showEditor(page: Page) {
  if (isMobile(page)) await page.getByRole("radio", { name: /Editar/ }).click();
}

test.beforeEach(async ({ context }) => {
  // Cada prueba arranca sin datos guardados.
  await context.addInitScript(() => {
    if (!sessionStorage.getItem("e2e-init")) {
      localStorage.clear();
      sessionStorage.setItem("e2e-init", "1");
    }
  });
});

test("crear una sopa de letras y descargar el PDF del alumno", async ({ page }) => {
  await openActivity(page, /Sopa de letras Palabras escondidas/);
  await showPreview(page);
  await expect(page.getByText("Palabras a encontrar (9):")).toBeVisible();

  const download = page.waitForEvent("download");
  if (isMobile(page)) {
    await page.getByRole("button", { name: "Descargar o compartir" }).click();
  } else {
    await page.getByRole("button", { name: /Descargar PDF/ }).click();
  }
  await page.getByRole("menuitem", { name: /Ficha del alumno/ }).click();
  const file = await download;
  expect(file.suggestedFilename()).toBe("Sopa_de_letras.pdf");
});

test("avisa cuando una palabra no entra y lo resuelve agrandando la cuadrícula", async ({ page }) => {
  await openActivity(page, /Sopa de letras Palabras escondidas/);
  await showEditor(page);
  await page.getByLabel("Palabra 1", { exact: true }).fill("ELECTRODOMESTICO");
  await page.getByRole("tab", { name: /Ajustes/ }).click();
  await page.getByRole("switch", { name: /Tamaño automático/ }).click();
  await page.getByLabel(/Tamaño: \d+×\d+/).fill("10");
  const warning = page.getByText(/no entró en la cuadrícula|no entraron en la cuadrícula/);
  await expect(warning).toBeVisible();
  await page.getByRole("button", { name: "Agrandar cuadrícula" }).click();
  await expect(page.getByText("Tamaño: 16×16")).toBeVisible();
  await expect(warning).toBeHidden();
});

test("regenerar se puede deshacer", async ({ page }) => {
  await openActivity(page, /Sudoku Tableros/);
  await showPreview(page);
  const sheet = page.locator(".paper-sheet").first();
  const before = await sheet.innerText();
  await page.getByRole("button", { name: "Otra variante" }).click();
  await expect.poll(() => sheet.innerText()).not.toBe(before);
  await page.getByRole("button", { name: "Deshacer" }).first().click();
  await expect.poll(() => sheet.innerText()).toBe(before);
});

test("guardar, encontrar en Mis fichas y volver a abrir", async ({ page }) => {
  await openActivity(page, /Crucigrama Palabras cruzadas/);
  await showEditor(page);
  await page.getByRole("tab", { name: /Hoja/ }).click();
  await page.getByLabel("Título de la ficha").fill("Animales del zoo");
  if (isMobile(page)) await page.getByRole("button", { name: "Guardar en Mis fichas" }).click();
  else await page.getByRole("button", { name: "Guardar", exact: true }).click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  await dialog.getByLabel("Carpeta").fill("Ciencias");
  await dialog.getByRole("button", { name: "Guardar", exact: true }).click();
  await expect(dialog).toBeHidden();

  await page.goto("/?tab=saved");
  await expect(page.getByRole("heading", { name: "Animales del zoo" })).toBeVisible();
  await expect(page.getByText("Crucigrama · Ciencias")).toBeVisible();
  await page.getByRole("button", { name: "Abrir", exact: true }).click();
  await expect(page.getByRole("heading", { level: 1, name: "Animales del zoo" })).toBeVisible();
});

test("los diálogos se cierran con Escape y el tema oscuro se aplica", async ({ page }) => {
  await openActivity(page, /Bingo de palabras/);
  await page.getByRole("button", { name: "Cambiar actividad" }).click();
  await expect(page.getByRole("dialog", { name: "Cambiar actividad" })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toBeHidden();

  await page.goto("/?tab=profile");
  await page.getByRole("radio", { name: "Oscuro" }).click();
  await expect(page.locator("html")).toHaveClass(/dark/);
  await page.reload();
  await expect(page.locator("html")).toHaveClass(/dark/);
});

test("el botón Atrás vuelve a la pestaña anterior", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: /Comunidad/ }).first().click();
  await expect(page.getByRole("heading", { name: "Comunidad" })).toBeVisible();
  await page.goBack();
  await expect(page.getByRole("heading", { name: /¿Qué quieres crear hoy\?/ })).toBeVisible();
});
