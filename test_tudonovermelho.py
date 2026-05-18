
import time
import os
import unittest
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options
from selenium.common.exceptions import TimeoutException


# ─── Configuração ────────────────────────────────────────────────────────────

# Caminho para o index.html do projeto (ajuste se necessário)
PROJECT_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "index.html")
PAGE_URL = f"file:///{PROJECT_PATH}"

SPIN_WAIT = 6      # segundos que a animação da roleta demora (aprox.)
SHORT_WAIT = 3     # timeout para elementos aparecerem




def create_driver():
    """Cria e retorna um ChromeDriver com as opções corretas."""
    options = Options()
    options.add_argument("--headless")           # roda sem abrir janela
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")
    options.add_argument("--window-size=1280,800")


    from webdriver_manager.chrome import ChromeDriverManager
    from selenium.webdriver.chrome.service import Service
    driver = webdriver.Chrome(
    service=Service(ChromeDriverManager().install()),
    options=options
)
 
    driver.get(PAGE_URL)
    return driver



class TestTelaInicial(unittest.TestCase):
    """TC-01 a TC-03 — Tela de início."""

    def setUp(self):
        self.driver = create_driver()
        self.wait = WebDriverWait(self.driver, SHORT_WAIT)

    def tearDown(self):
        self.driver.quit()

    # TC-01
    def test_01_tela_inicial_exibida(self):
        """A tela inicial deve estar visível ao carregar a página."""
        start_screen = self.driver.find_element(By.ID, "start-screen")
        self.assertFalse(
            "is-hidden" in start_screen.get_attribute("class"),
            "Tela inicial deve estar visível no carregamento.",
        )

    # TC-02
    def test_02_titulo_roleta_da_sorte(self):
        """O título 'Roleta da Sorte' deve aparecer na tela inicial."""
        h1 = self.driver.find_element(By.CSS_SELECTOR, "#start-screen h1")
        self.assertIn("Roleta", h1.text, "Título deve conter 'Roleta'.")

    # TC-03
    def test_03_botao_entrar_no_cassino(self):
        """Clicar em 'Entrar no Cassino' deve navegar para a tela de jogo."""
        btn = self.driver.find_element(By.ID, "start-button")
        btn.click()

        game_screen = self.wait.until(
            EC.visibility_of_element_located((By.ID, "game-screen"))
        )
        self.assertTrue(game_screen.is_displayed(), "Tela de jogo deve ficar visível.")


class TestTelaDeJogo(unittest.TestCase):
    """TC-04 a TC-11 — Tela de jogo."""

    def setUp(self):
        self.driver = create_driver()
        self.wait = WebDriverWait(self.driver, SHORT_WAIT)
        self.driver.find_element(By.ID, "start-button").click()
        self.wait.until(EC.visibility_of_element_located((By.ID, "game-screen")))

    def tearDown(self):
        self.driver.quit()

    # TC-04
    def test_04_saldo_inicial_1000(self):
        """O saldo inicial deve ser R$ 1.000."""
        balance = self.driver.find_element(By.ID, "balance").text
        self.assertIn("1.000", balance, f"Saldo inicial esperado R$ 1.000, obtido: {balance}")

    # TC-05
    def test_05_rodada_inicial_zero(self):
        """O contador de rodadas deve iniciar em 0."""
        rodada = self.driver.find_element(By.ID, "round-number").text
        self.assertEqual(rodada.strip(), "0", f"Rodada inicial esperada 0, obtida: {rodada}")

    # TC-06
    def test_06_perdas_iniciais_zero(self):
        """O total de perdas inicial deve ser R$ 0."""
        perdas = self.driver.find_element(By.ID, "total-lost").text
        self.assertIn("0", perdas, f"Perdas iniciais esperadas R$ 0, obtidas: {perdas}")

    # TC-07
    def test_07_selecionar_ficha_100(self):
        """Clicar na ficha de R$ 100 deve marcá-la como selecionada."""
        ficha = self.driver.find_element(By.CSS_SELECTOR, ".chip[data-value='100']")
        ficha.click()
        self.assertIn("is-selected", ficha.get_attribute("class"), "Ficha 100 deve ficar selecionada.")

    # TC-08
    def test_08_aposta_potencial_atualiza_com_ficha(self):
        """O ganho potencial deve dobrar ao selecionar uma ficha maior."""
        ficha_200 = self.driver.find_element(By.CSS_SELECTOR, ".chip[data-value='200']")
        ficha_200.click()
        potencial = self.driver.find_element(By.ID, "potential-win").text
        self.assertIn("400", potencial, f"Ganho potencial esperado R$ 400, obtido: {potencial}")

    # TC-09
    def test_09_alternar_cor_para_preto(self):
        """Selecionar 'Preto' deve marcar o botão preto como ativo."""
        btn_preto = self.driver.find_element(By.ID, "bet-black")
        btn_preto.click()
        self.assertIn("is-selected", btn_preto.get_attribute("class"), "Botão Preto deve ficar selecionado.")
        self.assertEqual(btn_preto.get_attribute("aria-pressed"), "true")

    # TC-10
    def test_10_girar_roleta_incrementa_rodada(self):
        """Após girar a roleta, o número da rodada deve ser 1."""
        self.driver.find_element(By.ID, "spin-button").click()
        time.sleep(SPIN_WAIT)

        rodada = self.driver.find_element(By.ID, "round-number").text
        self.assertEqual(rodada.strip(), "1", f"Rodada esperada 1 após 1 giro, obtida: {rodada}")

    # TC-11
    def test_11_resultado_exibido_apos_giro(self):
        """O painel de resultado deve aparecer após o giro."""
        self.driver.find_element(By.ID, "spin-button").click()
        time.sleep(SPIN_WAIT)

        result_box = self.driver.find_element(By.ID, "result-box")
        self.assertFalse(
            "is-hidden" in result_box.get_attribute("class"),
            "Painel de resultado deve estar visível após o giro.",
        )

    # TC-12
    def test_12_historico_registra_numero_sorteado(self):
        """O histórico de números deve ter 1 entrada após o primeiro giro."""
        self.driver.find_element(By.ID, "spin-button").click()
        time.sleep(SPIN_WAIT + 2)

        historico = self.driver.find_elements(By.CSS_SELECTOR, "#history-strip .history-dot")
        self.assertGreaterEqual(len(historico), 1, f"Esperado ao menos 1 número no histórico, encontrado: {len(historico)}")

    # TC-13
    def test_13_spin_button_desabilitado_durante_giro(self):
        """O botão 'Girar Roleta' não deve ser clicável durante a animação."""
        btn = self.driver.find_element(By.ID, "spin-button")
        btn.click()
        # Imediatamente verifica se ficou desabilitado
        desabilitado = self.driver.execute_script(
            "return document.getElementById('spin-button').disabled;"
        )
        self.assertTrue(desabilitado, "Botão deve ficar desabilitado durante o giro.")
        time.sleep(SPIN_WAIT)  # aguarda terminar para não quebrar próximos testes


class TestNavegacao(unittest.TestCase):
    """TC-14 e TC-15 — Navegação entre telas."""

    def setUp(self):
        self.driver = create_driver()
        self.wait = WebDriverWait(self.driver, SHORT_WAIT)

    def tearDown(self):
        self.driver.quit()

    # TC-14
    def test_14_voltar_ao_inicio(self):
        """'Voltar ao início' na tela de jogo deve retornar à tela inicial."""
        self.driver.find_element(By.ID, "start-button").click()
        self.wait.until(EC.visibility_of_element_located((By.ID, "game-screen")))

        self.driver.find_element(By.ID, "restart-button").click()

        start = self.wait.until(EC.visibility_of_element_located((By.ID, "start-screen")))
        self.assertTrue(start.is_displayed(), "Tela inicial deve voltar ao clicar em 'Voltar ao início'.")

    # TC-15
    def test_15_jogar_novamente_reinicia_saldo(self):
        """'Jogar Novamente' na tela de game over deve reiniciar com saldo R$ 1.000."""
        # Força game over via JavaScript (zera o saldo)
        self.driver.find_element(By.ID, "start-button").click()
        self.wait.until(EC.visibility_of_element_located((By.ID, "game-screen")))

        self.driver.execute_script("""
            state.balance = 0;
            state.betAmount = 50;
            showGameOver();
            """)

        self.wait.until(EC.visibility_of_element_located((By.ID, "gameover-screen")))
        self.driver.find_element(By.ID, "play-again-button").click()
        self.wait.until(EC.visibility_of_element_located((By.ID, "game-screen")))

        balance = self.driver.find_element(By.ID, "balance").text
        self.assertIn("1.000", balance, f"Saldo deve reiniciar em R$ 1.000 ao jogar novamente, obtido: {balance}")


class TestAcessibilidade(unittest.TestCase):
    """TC-16 — Verificações básicas de acessibilidade."""

    def setUp(self):
        self.driver = create_driver()

    def tearDown(self):
        self.driver.quit()

    # TC-16
    def test_16_botoes_tem_tipo_button(self):
        """Todos os botões devem ter type='button' para não submeter forms."""
        botoes = self.driver.find_elements(By.TAG_NAME, "button")
        for btn in botoes:
            tipo = btn.get_attribute("type")
            texto = btn.text or btn.get_attribute("id")
            self.assertEqual(tipo, "button", f"Botão '{texto}' deve ter type='button', tem type='{tipo}'.")


# ─── Entry point ─────────────────────────────────────────────────────────────

if __name__ == "__main__":
    unittest.main(verbosity=2)