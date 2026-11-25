export async function imprimirDocumento(
    elemento,
    titulo = "Global Airport",
    tipo = "comprobante"
) {
    if (!elemento) {
        throw new Error(
            "No se encontró el documento para imprimir."
        );
    }

    const esPaseAbordaje = tipo === "pase-abordaje";

    const ventana = window.open(
        "",
        "_blank",
        "width=1100,height=850"
    );

    if (!ventana) {
        throw new Error(
            "Permití las ventanas emergentes para imprimir el documento."
        );
    }

    try {
        const documento = ventana.document;

        documento.title = titulo;
        documento.documentElement.lang = "es";

        // Copiar los estilos de la aplicación
        const estilos = Array.from(
            window.document.querySelectorAll(
                'style, link[rel="stylesheet"]'
            )
        );

        const cargas = [];

        estilos.forEach((estilo) => {
            const copia = estilo.cloneNode(true);

            if (estilo.tagName === "LINK") {
                copia.href = estilo.href;

                cargas.push(
                    new Promise((resolve) => {
                        copia.onload = resolve;
                        copia.onerror = resolve;
                    })
                );
            }

            documento.head.appendChild(copia);
        });

        // Estilos generales de impresión
        const estilosGenerales = `
      html, body {
        margin: 0;
        padding: 0;
        background: white;
      }

      body {
        font-family: Arial, sans-serif;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }

      .documento-impresion {
        box-sizing: border-box;
        margin: 20px auto;
      }

      .documento-impresion * {
        box-sizing: border-box;
      }

      @media print {
        html, body {
          width: 100%;
          margin: 0 !important;
          padding: 0 !important;
        }

        .documento-impresion {
          margin: 0 auto !important;
          padding: 0 !important;
        }

        .documento-impresion > div {
          box-shadow: none !important;
        }
      }
    `;

        // Estilos del comprobante de reservación
        const estilosComprobante = `
      @page {
        size: A4 portrait;
        margin: 8mm;
      }

      .documento-impresion {
        width: 100%;
        max-width: 700px;
      }

      @media print {
        .documento-impresion {
          width: 100%;
          max-width: none;
        }

        .documento-impresion > div {
          overflow: visible !important;
        }

        .documento-impresion [class~="p-5"],
        .documento-impresion [class~="p-6"],
        .documento-impresion [class~="sm:p-6"] {
          padding: 12px !important;
        }

        .documento-impresion [class~="p-4"] {
          padding: 10px !important;
        }

        .documento-impresion [class~="py-5"] {
          padding-top: 10px !important;
          padding-bottom: 10px !important;
        }

        .documento-impresion [class~="pt-5"] {
          padding-top: 8px !important;
        }

        .documento-impresion [class~="space-y-5"] > * + * {
          margin-top: 8px !important;
          margin-bottom: 0 !important;
        }

        .documento-impresion [class~="mb-4"] {
          margin-bottom: 8px !important;
        }

        .documento-impresion [class~="gap-4"] {
          gap: 8px !important;
        }

        .documento-impresion [class~="text-3xl"] {
          font-size: 22px !important;
          line-height: 1.2 !important;
        }

        .documento-impresion [class~="text-2xl"] {
          font-size: 20px !important;
          line-height: 1.2 !important;
        }

        .documento-impresion [class~="text-sm"] {
          font-size: 11px !important;
          line-height: 1.3 !important;
        }

        .documento-impresion [class~="text-xs"] {
          font-size: 10px !important;
          line-height: 1.3 !important;
        }

        .documento-impresion section,
        .documento-impresion footer {
          break-inside: avoid;
          page-break-inside: avoid;
        }
      }
    `;

        // Estilos del pase de abordaje
        const estilosPaseAbordaje = `
      @page {
        size: A4 landscape;
        margin: 10mm;
      }

      .documento-impresion {
        width: 100%;
        max-width: 250mm;
      }

      .pase-abordaje {
        width: 100% !important;
        min-width: 0 !important;
        max-width: 100% !important;
      }

      @media print {
        .documento-impresion {
          width: 250mm;
          max-width: 100%;
          break-inside: avoid;
          page-break-inside: avoid;
        }

        .pase-abordaje {
          width: 100% !important;
          min-width: 0 !important;
          max-width: 100% !important;
          overflow: hidden !important;
          box-shadow: none !important;
          break-inside: avoid;
          page-break-inside: avoid;
        }

        .pase-abordaje [class~="p-5"] {
          padding: 12px !important;
        }

        .pase-abordaje [class~="p-4"] {
          padding: 10px !important;
        }

        .pase-abordaje [class~="p-3"] {
          padding: 8px !important;
        }

        .pase-abordaje [class~="py-4"] {
          padding-top: 10px !important;
          padding-bottom: 10px !important;
        }

        .pase-abordaje [class~="py-3"] {
          padding-top: 8px !important;
          padding-bottom: 8px !important;
        }

        .pase-abordaje [class~="pt-4"] {
          padding-top: 8px !important;
        }

        .pase-abordaje [class~="space-y-4"] > * + * {
          margin-top: 8px !important;
          margin-bottom: 0 !important;
        }

        .pase-abordaje [class~="gap-4"] {
          gap: 10px !important;
        }

        .pase-abordaje [class~="text-4xl"] {
          font-size: 30px !important;
          line-height: 1.1 !important;
        }

        .pase-abordaje [class~="text-2xl"] {
          font-size: 20px !important;
          line-height: 1.2 !important;
        }

        .pase-abordaje [class~="text-sm"] {
          font-size: 12px !important;
          line-height: 1.3 !important;
        }

        .pase-abordaje [class~="text-xs"] {
          font-size: 10px !important;
          line-height: 1.3 !important;
        }
      }
    `;

        // Seleccionar el formato de impresión
        const estiloImpresion =
            documento.createElement("style");

        estiloImpresion.textContent = `
      ${estilosGenerales}

      ${esPaseAbordaje
                ? estilosPaseAbordaje
                : estilosComprobante
            }
    `;

        documento.head.appendChild(estiloImpresion);

        // Crear el contenedor del documento
        const contenedor = documento.createElement("main");

        contenedor.className = "documento-impresion";

        // Copiar únicamente el documento seleccionado
        const copiaDocumento = elemento.cloneNode(true);

        contenedor.appendChild(copiaDocumento);

        documento.body.replaceChildren(contenedor);

        // Esperar a que se carguen los estilos
        await Promise.race([
            Promise.all(cargas),
            new Promise((resolve) =>
                setTimeout(resolve, 3000)
            ),
        ]);

        // Esperar a que se carguen las fuentes
        if (documento.fonts) {
            await documento.fonts.ready;
        }

        if (ventana.closed) {
            return;
        }

        // Cerrar la ventana al finalizar la impresión
        ventana.addEventListener(
            "afterprint",
            () => ventana.close(),
            { once: true }
        );

        ventana.focus();
        ventana.print();

    } catch (error) {
        ventana.close();
        throw error;
    }
}