// 이력서 편집 — data.json 을 폼으로 고치고 GitHub Contents API 로 커밋한다.
// 토큰은 입력칸에서 저장 순간에만 읽고, 변수·저장소 어디에도 남기지 않는다.
(function () {
  'use strict';

  var REPO = 'drsmin/skm-cv';
  var PATH = 'resume/data.json';

  var data = null;        // 편집 중인 내용
  var loadedText = null;  // 불러온(또는 마지막으로 저장한) data.json 원문 — 덮어쓰기 감지용

  // ── 필드 종류: 화면 값 ↔ 데이터 값
  var kinds = {
    text: { tag: 'input', get: function (v) { return v; }, put: function (v) { return v || ''; } },
    area: { tag: 'textarea', get: function (v) { return v; }, put: function (v) { return v || ''; } },
    // 한 줄에 하나
    lines: { tag: 'textarea', get: function (v) { return v.split('\n').map(trim).filter(Boolean); }, put: function (v) { return (v || []).join('\n'); } },
    // 빈 줄로 문단 구분
    paras: { tag: 'textarea', get: function (v) { return v.split(/\n\s*\n/).map(trim).filter(Boolean); }, put: function (v) { return (v || []).join('\n\n'); } },
    // 쉼표로 구분
    csv: { tag: 'input', get: function (v) { return v.split(',').map(trim).filter(Boolean); }, put: function (v) { return (v || []).join(', '); } },
    // "YYYY-MM", 비우면 null (끝 날짜는 「현재」)
    month: { tag: 'input', type: 'month', get: function (v) { return v || null; }, put: function (v) { return v || ''; } }
  };

  function trim(s) { return s.trim(); }

  function el(tag, attrs, children) {
    var node = document.createElement(tag);
    Object.keys(attrs || {}).forEach(function (k) {
      if (k === 'text') node.textContent = attrs[k];
      else if (k === 'on') Object.keys(attrs.on).forEach(function (e) { node.addEventListener(e, attrs.on[e]); });
      else node.setAttribute(k, attrs[k]);
    });
    (children || []).forEach(function (c) { if (c) node.appendChild(c); });
    return node;
  }

  // obj[key] 를 고치는 입력칸 하나. key 가 null 이면 obj 는 [배열, 인덱스].
  function field(label, kind, obj, key, cls) {
    var k = kinds[kind];
    var input = el(k.tag, { spellcheck: 'false' });
    if (k.type) input.type = k.type;
    if (k.tag === 'input' && !k.type) input.type = 'text';
    input.value = k.put(obj[key]);
    if (kind === 'lines' || kind === 'paras') input.rows = Math.min(10, Math.max(3, input.value.split('\n').length + 1));
    input.addEventListener('input', function () { obj[key] = k.get(input.value); });
    return el('label', { class: 'field ' + (cls || '') }, [el('span', { text: label }), input]);
  }

  // 순서를 바꾸고 지울 수 있는 목록. make(item, i) 가 카드 본문을, blank() 가 새 항목을 만든다.
  function listEditor(arr, make, blank, noun) {
    var box = el('div');
    function draw() {
      box.textContent = '';
      arr.forEach(function (item, i) {
        function move(d) { return function () { arr.splice(i + d, 0, arr.splice(i, 1)[0]); draw(); }; }
        var tools = el('div', { class: 'card-tools' }, [
          el('span', { class: 'no', text: noun + ' ' + (i + 1) }),
          el('span', { class: 'btns' }, [
            el('button', { type: 'button', text: '↑', title: '위로', on: { click: move(-1) } }),
            el('button', { type: 'button', text: '↓', title: '아래로', on: { click: move(1) } }),
            el('button', { type: 'button', class: 'danger', text: '삭제', on: { click: function () {
              if (confirm(noun + ' ' + (i + 1) + ' 을(를) 지울까요?')) { arr.splice(i, 1); draw(); }
            } } })
          ])
        ]);
        tools.querySelector('[title="위로"]').disabled = i === 0;
        tools.querySelector('[title="아래로"]').disabled = i === arr.length - 1;
        box.appendChild(el('div', { class: 'card' }, [tools].concat(make(item, i))));
      });
      box.appendChild(el('button', { type: 'button', class: 'add', text: '+ ' + noun + ' 추가', on: { click: function () {
        arr.unshift(blank()); draw();
      } } }));
    }
    draw();
    return box;
  }

  function section(title, body) {
    return el('section', {}, [el('h2', { text: title })].concat(body));
  }

  function buildForm() {
    var p = data.profile = data.profile || {};
    p.contact = p.contact || {};
    data.skills = data.skills || [];
    data.goals = data.goals || [];
    data.certifications = data.certifications || [];
    data.projects = data.projects || [];
    var pf = data.portfolio = data.portfolio || {};
    pf.troubleshooting = pf.troubleshooting || [];
    pf.works = pf.works || [];

    var form = document.getElementById('form');
    form.textContent = '';
    [
      section('프로필', [
        el('div', { class: 'row' }, [field('이름', 'text', p, 'name', 'half'), field('영문 이름', 'text', p, 'nameEn', 'half')]),
        el('div', { class: 'row' }, [field('이메일 (여러 개는 쉼표로)', 'text', p.contact, 'email', 'half'), field('전화', 'text', p.contact, 'phone', 'half')]),
        field('GitHub 주소', 'text', p.contact, 'github'),
        field('요약 (한 줄에 하나, 첫 줄이 굵게)', 'lines', p, 'summary'),
        field('소개 (빈 줄로 문단 구분)', 'paras', p, 'intro')
      ]),
      section('보유 기술 / 플랫폼', [listEditor(data.skills, function (s) {
        return [
          el('div', { class: 'row' }, [field('이름', 'text', s, 'name', 'grow'), field('분야 (같은 분야끼리 한 줄)', 'text', s, 'group', 'month')]),
          field('설명', 'area', s, 'description')
        ];
      }, function () { return { name: '', group: '', description: '' }; }, '기술')]),
      section('자격', [field('자격증 (한 줄에 하나)', 'lines', data, 'certifications')]),
      section('목표 및 포부', [listEditor(data.goals, function (g, i) {
        return [field('내용', 'area', data.goals, i)];
      }, function () { return ''; }, '목표')]),
      section('프로젝트 이력 (최신이 위)', [listEditor(data.projects, function (pr) {
        return [
          el('div', { class: 'row' }, [field('프로젝트명', 'text', pr, 'title', 'grow'), field('구분', 'text', pr, 'type', 'month')]),
          el('div', { class: 'row' }, [field('시작', 'month', pr, 'start', 'month'), field('끝 (비우면 현재)', 'month', pr, 'end', 'month')]),
          field('개요', 'area', pr, 'summary'),
          field('역할', 'area', pr, 'role'),
          field('주요 기술 (쉼표로 구분)', 'csv', pr, 'tech')
        ];
      }, function () { return { title: '', type: '', start: null, end: null, summary: '', role: '', tech: [] }; }, '프로젝트')]),
      section('문제 해결 사례', [listEditor(pf.troubleshooting, function (c) {
        return [
          el('div', { class: 'row' }, [field('제목', 'text', c, 'title', 'grow'), field('어느 프로젝트에서', 'text', c, 'project', 'half')]),
          field('문제 (한 줄에 하나)', 'lines', c, 'problem'),
          field('원인 (한 줄에 하나)', 'lines', c, 'cause'),
          field('해결 (한 줄에 하나)', 'lines', c, 'solution'),
          field('결과 (한 줄에 하나, 숫자로)', 'lines', c, 'result')
        ];
      }, function () { return { title: '', problem: [], cause: [], solution: [], result: [] }; }, '사례')]),
      section('개인 개발', [listEditor(pf.works, function (w) {
        return [
          el('div', { class: 'row' }, [field('제목', 'text', w, 'title', 'grow'), field('구분', 'text', w, 'type', 'month')]),
          field('설명 (한 줄에 하나)', 'lines', w, 'description')
        ];
      }, function () { return { title: '', type: '', description: [] }; }, '개발')])
    ].forEach(function (n) { form.appendChild(n); });
  }

  // ── 저장

  function today() {
    var d = new Date();
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }

  function serialize() {
    data.updated = today();
    return JSON.stringify(data, null, 2) + '\n';
  }

  function toBase64(text) {
    var bin = '';
    new TextEncoder().encode(text).forEach(function (b) { bin += String.fromCharCode(b); });
    return btoa(bin);
  }

  function fromBase64(b64) {
    var bin = atob(b64.replace(/\s/g, ''));
    var bytes = new Uint8Array(bin.length);
    for (var i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return new TextDecoder().decode(bytes);
  }

  function status(msg, cls) {
    var s = document.getElementById('status');
    s.textContent = msg;
    s.className = 'status ' + (cls || '');
  }

  function api(token, method, url, body) {
    return fetch('https://api.github.com/repos/' + REPO + url, {
      method: method,
      headers: {
        'Accept': 'application/vnd.github+json',
        'Authorization': 'Bearer ' + token,
        'X-GitHub-Api-Version': '2022-11-28'
      },
      body: body ? JSON.stringify(body) : undefined,
      cache: 'no-store'
    }).then(function (r) {
      return r.json().catch(function () { return {}; }).then(function (j) {
        if (r.ok) return j;
        var why = {
          401: '토큰이 올바르지 않거나 만료됐습니다',
          403: '토큰에 이 저장소의 Contents 쓰기 권한이 없습니다',
          404: '저장소·브랜치를 찾지 못했거나 토큰에 접근 권한이 없습니다',
          409: '그 사이 다른 커밋이 있었습니다. 새로고침 후 다시 시도하세요',
          422: '요청이 거부됐습니다'
        }[r.status] || ('GitHub 오류 ' + r.status);
        throw new Error(why + (j.message ? ' (' + j.message + ')' : ''));
      });
    });
  }

  function save() {
    var tokenInput = document.getElementById('token');
    var branch = document.getElementById('branch').value.trim() || 'master';
    var message = document.getElementById('message').value.trim() || '이력서 수정';
    if (!tokenInput.value.trim()) { status('토큰을 넣어 주세요.', 'err'); tokenInput.focus(); return; }
    var button = document.getElementById('save');
    button.disabled = true;
    status('GitHub 의 현재 파일을 확인하는 중…');

    var token = tokenInput.value.trim();
    var ref = '/contents/' + PATH + '?ref=' + encodeURIComponent(branch);
    api(token, 'GET', ref).catch(function (e) {
      if (/찾지 못했/.test(e.message)) return null; // 아직 파일이 없는 브랜치 — 새로 만든다
      throw e;
    }).then(function (remote) {
      if (remote && loadedText !== null && fromBase64(remote.content) !== loadedText &&
          !confirm('GitHub 의 data.json 이 이 페이지를 연 뒤 바뀌었습니다. 지금 내용으로 덮어쓸까요?')) {
        throw new Error('저장을 취소했습니다');
      }
      var text = serialize();
      status('저장하는 중…');
      return api(token, 'PUT', '/contents/' + PATH, {
        message: message,
        content: toBase64(text),
        branch: branch,
        sha: remote ? remote.sha : undefined
      }).then(function (res) {
        loadedText = text;
        var sha = res.commit && res.commit.sha ? res.commit.sha.slice(0, 7) : '';
        status('저장했습니다 ' + sha + ' — 공개 페이지에는 1~2분 뒤 반영됩니다.', 'ok');
      });
    }).catch(function (e) {
      status(e.message, 'err');
    }).then(function () {
      token = null;
      button.disabled = false;
    });
  }

  function download() {
    var blob = new Blob([serialize()], { type: 'application/json' });
    var a = el('a', { href: URL.createObjectURL(blob), download: 'data.json' });
    document.body.appendChild(a);
    a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 0);
  }

  document.getElementById('save').addEventListener('click', save);
  document.getElementById('download').addEventListener('click', download);

  fetch('data.json', { cache: 'no-cache' })
    .then(function (r) { if (!r.ok) throw new Error(r.status); return r.text(); })
    .then(function (text) {
      loadedText = text;
      data = JSON.parse(text);
      buildForm();
    })
    .catch(function (e) {
      document.getElementById('form').textContent = '이력서 데이터를 불러오지 못했습니다 (' + e.message + ').';
    });
})();
