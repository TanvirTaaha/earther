defmodule Earther.Repo do
  use Ecto.Repo,
    otp_app: :earther,
    adapter: Ecto.Adapters.SQLite3
end
