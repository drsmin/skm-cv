// resume/data.json 을 읽어 이력서를 그린다. 형식은 docs/resume-design.md 참고.
(function () {
  'use strict';

  // children 은 노드 또는 문자열
  function el(tag, attrs, children) {
    var node = document.createElement(tag);
    Object.keys(attrs || {}).forEach(function (k) {
      if (k === 'text') node.textContent = attrs[k];
      else node.setAttribute(k, attrs[k]);
    });
    (children || []).forEach(function (c) {
      if (c == null || c === false) return;
      node.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
    });
    return node;
  }

  function list(tag, cls, items) {
    return el(tag, cls ? { class: cls } : {}, items.map(function (t) { return el('li', { text: t }); }));
  }

  // "2019-08" → "2019.08", null → "현재"
  function ym(v) { return v ? v.replace('-', '.') : '현재'; }

  // "2019-08" → 개월 수 (null 은 오늘)
  function months(v) {
    var d = new Date();
    var m = v ? v.split('-') : [d.getFullYear(), d.getMonth() + 1];
    return Number(m[0]) * 12 + Number(m[1]) - 1;
  }

  // 시작·끝 달을 모두 넣어 센 기간 → "1년 3개월"
  function duration(start, end) {
    var n = months(end) - months(start) + 1;
    if (!start || n < 1) return '';
    var y = Math.floor(n / 12), m = n % 12;
    return (y ? y + '년' : '') + (y && m ? ' ' : '') + (m ? m + '개월' : '');
  }

  function pad(n) { return (n < 10 ? '0' : '') + n; }

  // 머리말: 영문 부제 + 영문 이름 위 작은 글씨 + 한글 제목
  function section(title, en, body, cls) {
    return el('section', { class: 'sec' + (cls ? ' ' + cls : '') }, [
      el('header', { class: 'sec-head' }, [el('span', { class: 'eyebrow', text: en }), el('h2', { text: title })]),
      el('div', { class: 'sec-body' }, body)
    ]);
  }

  // 프로젝트에 가장 많이 쓴 기술 n 개
  function topTech(projects, n) {
    var count = {};
    projects.forEach(function (p) { (p.tech || []).forEach(function (t) { count[t] = (count[t] || 0) + 1; }); });
    return Object.keys(count).sort(function (a, b) { return count[b] - count[a]; }).slice(0, n);
  }

  function profile(p, d) {
    var c = p.contact || {};
    var projects = d.projects || [];
    var contacts = [];
    if (c.email) contacts.push(el('li', {}, [el('span', { class: 'k', text: 'Email' }), el('a', { href: 'mailto:' + c.email, text: c.email })]));
    if (c.phone) {
      // 가린 번호(010-****-…)는 전화 링크를 만들지 않는다 (D-008)
      var phone = /\*/.test(c.phone) ? el('span', { text: c.phone }) : el('a', { href: 'tel:' + c.phone.replace(/[^+\d]/g, ''), text: c.phone });
      contacts.push(el('li', {}, [el('span', { class: 'k', text: 'Phone' }), phone]));
    }

    // 요약 지표는 data.json 에서 계산한다 — 따로 적어 둘 필요 없음
    var starts = projects.map(function (x) { return x.start; }).filter(Boolean).sort();
    var stats = [];
    if (starts.length) stats.push([Math.floor((months(null) - months(starts[0]) + 1) / 12) + '년+', '경력']);
    if (projects.length) stats.push([String(projects.length), '프로젝트']);
    if (d.skills && d.skills.length) stats.push([String(d.skills.length), '핵심 기술']);

    var tech = topTech(projects, 6);
    return el('header', { class: 'profile' }, [
      el('div', { class: 'hero-main' }, [
        p.nameEn ? el('p', { class: 'name-en', text: p.nameEn }) : null,
        el('h1', { text: p.name }),
        p.headline ? el('p', { class: 'headline', text: p.headline }) : null,
        tech.length ? list('ul', 'top-tech', tech) : null
      ]),
      el('div', { class: 'hero-side' }, [
        contacts.length ? el('ul', { class: 'contact' }, contacts) : null,
        stats.length ? el('dl', { class: 'stats' }, stats.map(function (s) {
          return el('div', {}, [el('dt', { text: s[1] }), el('dd', { text: s[0] })]);
        })) : null
      ])
    ]);
  }

  function project(pr) {
    return el('li', { class: 'tl-item' + (pr.end ? '' : ' current') }, [
      el('div', { class: 'tl-when' }, [
        el('span', { class: 'period', text: ym(pr.start) + ' – ' + ym(pr.end) }),
        el('span', { class: 'dur', text: pr.end ? duration(pr.start, pr.end) : '진행 중' })
      ]),
      el('div', { class: 'tl-body' }, [
        el('h3', {}, [pr.title, pr.type ? el('span', { class: 'badge', text: pr.type }) : null]),
        pr.summary ? el('p', { class: 'summary', text: pr.summary }) : null,
        pr.role ? el('p', { class: 'role' }, [el('span', { class: 'k', text: '역할' }), pr.role]) : null,
        pr.tech && pr.tech.length ? list('ul', 'chips', pr.tech) : null
      ])
    ]);
  }

  function troubleshooting(c, i) {
    var rows = [['problem', '문제', c.problem], ['cause', '원인', c.cause], ['solution', '해결', c.solution]];
    return el('article', { class: 'case' }, [
      el('h3', {}, [el('span', { class: 'num', text: pad(i + 1) }), c.title]),
      el('div', { class: 'steps' }, rows.filter(function (r) { return r[2] && r[2].length; }).map(function (r) {
        return el('div', { class: 'step ' + r[0] }, [el('span', { class: 'step-k', text: r[1] }), list('ul', '', r[2])]);
      }))
    ]);
  }

  function work(w) {
    return el('article', { class: 'work' }, [
      el('h3', { text: w.title }),
      w.type ? el('p', { class: 'work-type', text: w.type }) : null,
      list('ul', 'desc', w.description || [])
    ]);
  }

  function render(d) {
    var app = document.getElementById('app');
    var p = d.profile || {};
    var pf = d.portfolio || {};
    var hasCases = pf.troubleshooting && pf.troubleshooting.length;
    document.title = (p.name || '') + '_이력서'; // PDF 로 저장할 때 기본 파일 이름이 된다
    app.textContent = '';
    [
      profile(p, d),
      p.intro && p.intro.length ? section('소개', 'About', [el('div', { class: 'intro' }, p.intro.map(function (t) { return el('p', { text: t }); }))]) : null,
      d.skills && d.skills.length ? section('보유 기술', 'Skills', [el('div', { class: 'skills' }, d.skills.map(function (s) {
        return el('div', { class: 'skill' }, [el('h3', { text: s.name }), s.description ? el('p', { text: s.description }) : null]);
      }))]) : null,
      d.goals && d.goals.length ? section('목표 및 포부', 'Goals', [list('ol', 'goals', d.goals)]) : null,
      d.projects && d.projects.length ? section('프로젝트 이력', 'Experience', [el('ol', { class: 'timeline' }, d.projects.map(project))]) : null,
      hasCases ? section('문제 해결 사례', 'Problem Solving', pf.troubleshooting.map(troubleshooting), 'portfolio portfolio-start') : null,
      pf.works && pf.works.length ? section('개인 개발', 'Side Projects', [el('div', { class: 'works' }, pf.works.map(work))], 'portfolio' + (hasCases ? '' : ' portfolio-start')) : null,
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
