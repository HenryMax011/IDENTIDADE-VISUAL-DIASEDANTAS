const webhookUrl = "COLOQUE_Sua_URL_AQUI";
  const whatsappNumber = "NUMERO_AQUI";

  const form = document.getElementById("leadForm");
  const submitBtn = document.getElementById("submitBtn");
  const formStatus = document.getElementById("formStatus");

  function sanitize(value) {
    return value.trim().replace(/\s+/g, " ");
  }

  function setStatus(message, type) {
    formStatus.textContent = message;
    formStatus.className = type || "";
  }

  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      const nome = sanitize(document.getElementById("nome").value);
      const telefone = sanitize(document.getElementById("telefone").value);
      const email = sanitize(document.getElementById("email").value);

      if (!nome || !telefone || !email) {
        setStatus("Por favor, preencha todos os campos para continuarmos.", "error");
        return;
      }

      const payload = {
        nome,
        telefone,
        email,
        origem: "landing-page-mdplast"
      };

      submitBtn.disabled = true;
      setStatus("Enviando seus dados de forma segura...", "");

      try {
        const response = await fetch(webhookUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(payload)
        });

        if (!response.ok) {
          throw new Error(`Erro no webhook: ${response.status}`);
        }

        setStatus("Tudo certo! Redirecionando para o WhatsApp...", "success");

        // Mensagem formatada de forma mais comercial e amigável
        const waText = encodeURIComponent(
          `Olá, equipe MDPLAST! Meu nome é ${nome} e gostaria de entender melhor como vocês podem ajudar com a regularização da minha empresa.\n\nMeu e-mail de contato é: ${email}`
        );
        const waUrl = `https://wa.me/${whatsappNumber}?text=${waText}`;

        // Pequeno delay para o usuário conseguir ler a mensagem de sucesso
        setTimeout(() => {
            window.location.href = waUrl;
        }, 800);
        
      } catch (error) {
        setStatus(
          "Ops, tivemos um problema ao enviar. Por favor, verifique os dados ou chame direto no WhatsApp.",
          "error"
        );
        submitBtn.disabled = false;
        console.error(error);
      }
    });
  }