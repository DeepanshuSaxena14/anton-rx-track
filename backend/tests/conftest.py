import pytest

class MockSupabaseChain:
    def __init__(self, return_data=None):
        self.return_data = return_data if return_data is not None else []
        self._data_obj = type("DataObj", (), {"data": self.return_data})()
        
    def table(self, *args, **kwargs): return self
    def select(self, *args, **kwargs): return self
    def eq(self, *args, **kwargs): return self
    def ilike(self, *args, **kwargs): return self
    def or_(self, *args, **kwargs): return self
    def limit(self, *args, **kwargs): return self
    def order(self, *args, **kwargs): return self
    def insert(self, *args, **kwargs): return self
    def rpc(self, *args, **kwargs): return self
    
    # Storage mocks
    @property
    def storage(self): return self
    def from_(self, *args, **kwargs): return self
    def upload(self, *args, **kwargs): return type("UploadRes", (), {"path": kwargs.get("path", "mock.pdf")})()
    def get_public_url(self, *args, **kwargs): return f"http://mock-url.com/{args[0]}"
    
    def execute(self): return self._data_obj

@pytest.fixture
def mock_supabase_client():
    def _make_mock(data=None):
        return MockSupabaseChain(return_data=data)
    return _make_mock
