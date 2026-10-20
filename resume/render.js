// resume/data.json 을 읽어 이력서를 그린다. 형식은 docs/resume-design.md 참고.
(function () {
  'use strict';

  function el(tag, attrs, children) {
    var node = document.createElement(tag);
    Object.keys(attrs || {}).forEach(function (k) {
      if (k === 'text') node.textContent = attrs[k];
      else node.setAttribute(k, attrs[k]);
    });
    (children || []).forEach(function (c) { if (c) node.appendChild(c); });
    return node;
  }

  function list(tag, cls, items) {
    return el(tag, { class: cls }, items.map(function (t) { return el('li', { text: t }); }));
  }

  // "2019-08" → "2019.08", null → "현재"
  function ym(v) { return v ? v.replace('-', '.') : '현재'; }

  // 왼쪽 칸에 제목(한글 + 영문 부제), 오른쪽 칸에 본문
  function section(title, en, body, cls) {
    var h2 = el('h2', { text: title }, [el('small', { text: en })]);
    return el('section', cls ? { class: cls } : {}, [h2, el('div', { class: 'body' }, body)]);
  }

  function profile(p) {
    var c = p.contact || {};
    var contacts = [];
    if (c.email) contacts.push(el('li', {}, [el('b', { text: 'Email' }), el('a', { href: 'mailto:' + c.email, text: c.email })]));
    if (c.phone) {
      // 가린 번호(010-****-…)는 전화 링크를 만들지 않는다 (D-008)
      var phone = /\*/.test(c.phone) ? el('span', { text: c.phone }) : el('a', { href: 'tel:' + c.phone.replace(/[^+\d]/g, ''), text: c.phone });
      contacts.push(el('li', {}, [el('b', { text: 'Phone' }), phone]));
    }
    return el('header', { class: 'profile' }, [
      el('div', {}, [el('h1', { text: p.name }), p.nameEn ? el('p', { class: 'en', text: p.nameEn }) : null]),
      el('ul', { class: 'contact' }, contacts)
    ]);
  }

  function project(pr) {
    var head = el('h3', {}, [document.createTextNode(pr.title), pr.type ? el('span', { class: 'badge', text: pr.type }) : null]);
    return el('div', { class: 'item' }, [
      el('div', { class: 'item-head' }, [head, el('span', { class: 'period', text: ym(pr.start) + ' ~ ' + ym(pr.end) })]),
      pr.summary ? el('p', { text: pr.summary }) : null,
      pr.role ? el('p', { class: 'role' }, [el('b', { text: '역할' }), document.createTextNode(pr.role)]) : null,
      pr.tech && pr.tech.length ? list('ul', 'chips', pr.tech) : null
    ]);
  }

  function troubleshooting(c) {
    var rows = [['문제', c.problem], ['원인', c.cause], ['해결', c.solution]];
    return el('div', { class: 'item' }, [
      el('h3', { text: c.title }),
      el('dl', { class: 'case' }, rows.reduce(function (acc, r) {
        if (r[1] && r[1].length) acc.push(el('dt', { text: r[0] }), el('dd', {}, [list('ul', '', r[1])]));
        return acc;
      }, []))
    ]);
  }

  function work(w) {
    var head = el('h3', {}, [document.createTextNode(w.title), w.type ? el('span', { class: 'badge', text: w.type }) : null]);
    return el('div', { class: 'item' }, [head, list('ul', 'desc', w.description || [])]);
  }

  function render(d) {
    var app = document.getElementById('app');
    var p = d.profile || {};
    var pf = d.portfolio || {};
    document.title = (p.name || '') + '_이력서'; // PDF 로 저장할 때 기본 파일 이름이 된다
    app.textContent = '';
    [
      profile(p),
      p.intro && p.intro.length ? section('소개', 'Profile', [el('div', { class: 'intro' }, p.intro.map(function (t) { return el('p', { text: t }); }))]) : null,
      d.skills && d.skills.length ? section('보유 기술', 'Skills', [el('dl', { class: 'skills' }, d.skills.reduce(function (acc, s) {
        acc.push(el('div', {}, [el('dt', { text: s.name }), el('dd', { text: s.description || '' })]));
        return acc;
      }, []))]) : null,
      d.goals && d.goals.length ? section('목표 및 포부', 'Goals', [list('ol', 'goals', d.goals)]) : null,
      d.projects && d.projects.length ? section('프로젝트 이력', 'Projects', d.projects.map(project)) : null,
      pf.troubleshooting && pf.troubleshooting.length ? section('문제 해결 사례', 'Problem Solving', pf.troubleshooting.map(troubleshooting), 'portfolio portfolio-start') : null,
      pf.works && pf.works.length ? section('개인 개발', 'Side Projects', pf.works.map(work), 'portfolio' + (pf.troubleshooting && pf.troubleshooting.length ? '' : ' portfolio-start')) : null,
      d.updated ? el('footer', { text: '최종 수정 ' + d.updated }) : null
    ].forEach(function (n) { if (n) app.appendChild(n); });
  }

  // 도구 막대: PDF 다운로드(서버에서 미리 만든 파일 — scripts/build-pdf.mjs), 인쇄, 포트폴리오 포함 여부
  var toggle = document.getElementById('with-portfolio');
  var pdf = document.getElementById('pdf');
  if (toggle) {
    toggle.addEventListener('change', function () {
      document.body.classList.toggle('no-portfolio', !toggle.checked);
      if (pdf) {
        pdf.href = toggle.checked ? 'pdf/resume.pdf' : 'pdf/resume-only.pdf';
        pdf.download = toggle.checked ? '송강민_이력서.pdf' : '송강민_이력서_요약.pdf';
      }
    });
  }
  var printBtn = document.getElementById('print');
  if (printBtn) printBtn.addEventListener('click', function () { window.print(); });

  fetch('data.json', { cache: 'no-cache' })
    .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
    .then(render)
    .catch(function (e) {
      document.getElementById('app').textContent = '이력서 데이터를 불러오지 못했습니다 (' + e.message + ').';
    });
})();
