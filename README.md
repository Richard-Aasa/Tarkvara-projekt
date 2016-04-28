# Tarkvara-projekt

Installi app (Pole vajalik kui server on Openshiftis tehtud, ainult vajalik kui tahad lokaalselt testida nt. netti pole):
  Installeeri https://nodejs.org/en/download/ - kontrolli kas töötab kirjutades terminalis 'node -v'
  Järgmiseks, olles kloonitud kaustas kirjuta: 'npm install' - see peaks tõmbama kõik vajalikud moodulid mainitud package.json kaustas
  Angular on staatiline 'library', selle paigaldamiseks: 'npm install -g bower' ja seejärel 'bower install' - see peaks tõmbama kõik vajalikud library'd mainitud failis bower.json
  
Testimine:
  Hakkame kasutama Openshift cloud hostingut. See võimaldab repo commitimisel kohe näha uuendusi ja keegi ei pea eelnevat
    installeerimist tegema, kuna need tööriistad oleksid serveri peal valmis.
  Momendil aga võib peale appi installimist kirjutada kloonitud kaustad 'node server' ja minna localhost:3000 addressile brauseris.
